"""Functions for sending/receiving data from the CYBEX backend.

This module provides three categories of functions for interfacing with the 
CYBEX backend. The first is a set of functions for requesting data on related
IOCs and threat data for IOCs. To return related IOCs, use 
cybexRelatedHandler(). threadedLoop_cybexRelatedHandler() and 
insertRelatedAttributes() are associated helper functions. To return threat
data about an IOC, use cybexCountHandler(). insertCybexCount() is an 
associated helper function.

The second category of functions handles submitting event data to the CYBEX
backend.

The third category of functions handles CYBEX administrative information, such
as getting user, organization, admin, and ACL information. Functions are
provided for making changes to the above administrative properties.

"""

from py2neo import Graph, Node, Relationship
from cybexapi.exportDB import bucket
from cybexapi.api import *
import json
import requests
from django.conf import settings
from threading import Timer
from cybexapi.shodanSearch import insert_ports
import threading

# deprecated, testing if still being used..
# def pull_ip_src():

#     ip_list = []

#     with open('data/ti.json') as f:
#         data = json.load(f)

#         for entry in data['response']['Attribute']:
#             if (entry['type'] == "ip-src"):
#                 ip_list.append(entry['value'])

#     return ip_list

def insertCybexCount(num_benign, num_mal, graph, value, ntype):
    """Adds Cybex Count and Malicious Count to node data.

    Args:
        num_benign (int): Number of sightings in benign CYBEX event contexts
        num_mal (int): Number of sightings in malicious CYBEX event contexts
        graph (py2neo.database.Graph): The graph object for the current graph
        value (string): JSON data for the originating node
        ntype (string): The IOC type of the originating node

    Returns:
        1 if successful
    """
    ip_node = graph.nodes.match(ntype, data=value).first()
    if(ip_node):
        ip_node["count"] = num_benign
        ip_node["countMal"] = num_mal
        graph.push(ip_node)
        print("CybexCount added to node")
    else:
        print("Error adding CybexCount")
        return -1
    return 1

def insertRelatedAttributes(data, graph, value, original_type, insertions_to_make):
    """Adds related attributes queried from CYBEX to insertions_to_make dict.

    Args:
        data (string): JSON response string from the Related Attribute Summary API call
        graph (py2neo.database.Graph): The graph object for the current graph
        value (string): JSON data for the originating node 
        original_type (string): IOC type of originating node
        insertions_to_make (dict): dictionary with each key representing each
            node to add to graph. Each value is the Relationship object
            that will be later processed to insert the relationship into the
            neo4j graph

    Returns:
        int: 1 if successful
    """
    # iterate over all related attributes..
    for attr, val in data["data"].items():
        # format IOC type labels to be most human-readable
        attr = bucket(attr)
        original_type = bucket(original_type)
        valString = ""
        # Only connect ports to graph if the original node is of type 'IP'
        # Doesn't make sense to add ports to a url node, for example
        if attr == "Ports":
            if original_type == "IP" or original_type == "Subnet":
                # Special case for ports. Group them together.
                insert_ports(val,graph,value)
        else:
            for nodeData in val:
                # Create a temporary node with the given data for comparsions
                c = Node(attr, data=nodeData)
                c["source"] = "cybex"
                # Get the existing node from which this query originates
                original_node = graph.nodes.match(data=value).first()
                # see if a node already exists with the new data
                c_node = graph.nodes.match(attr, data=nodeData).first()
                
                # if c_node is true, an existing node matched the given data
                if(c_node):
                    # if the new node is different from the originating node..
                    if (original_node != c_node):
                        # create relationshop object from originating node to
                        # the matching existing node 
                        rel = Relationship(original_node, "CYBEX", c_node)
                        # Add relationship object to key of dict that
                        # corresponds to the appropriate node. Note that the
                        # key is the data value of the node, represented as a
                        # string, with an '_r' appended. This is done to cast
                        # all node values as strings for easy indexing of dict
                        insertions_to_make[nodeData+"_r"] = rel
                        print("Existing CybexRelated node linked")
                    else:
                        print("Related node is same as origin node. Skipped.")
                else:
                    # no existing node with given data is found...
                    # create relationship object from originating node to the
                    # newly created node
                    rel = Relationship(original_node, "CYBEX", c)
                    insertions_to_make[nodeData +"_r"] = rel
                    print("New CybexRelated node created and linked")

    return 1


def replaceType(value):
    """Format IOC types to match the strings the backend expects."""
    if value == "Email":
        return "email_addr"
    elif value == "Host":
        return "hostname"
    elif value == "URL":
        return "url"
    elif value == "Domain":
        return "domain"
    elif value == "User":
        return "username"
    else:
        return value.lower()

# TODO
# Use django.settings to get keys and move URLS to settings as well.
def cybexCountHandler(ntype, data, graph, user, event):
    """Queries CYBEX for benign and malicious counts of the given IOC.

    Args:
        ntype (string): The IOC type of the originating node
        data: The data value of the originating node
        graph (py2neo.database.Graph): The graph object for the current graph
        user (django.contrib.auth.models.User): The current user making the 
            request
        event (threading.Event): Thread event object for faciliting the use
            of event.wait() between request attempts

    Returns:
        int: 1 if successful
    """
    # process the IOC type to ensure it matches the string the backend expects
    ntype_processed = replaceType(ntype)
    # First, query count (sightings in benign contexts)...

    # The url to be used for the query to the CYBEX API
    url = "https://cybex-api.cse.unr.edu:5000/query"
    # Retrieve the token of the current user. This is stored in the django
    # user profile model and is created by the backend upon user creation.
    # The token is required for authenticating the request
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}

    # construct the data object to be passed to post request
    payload = {
        "type": "count", #specify that we want count data
        "data" : {
            "sub_type": ntype_processed, 
            "data": data,
            "category": "all",
            "context": "all",
            "last": "1Y"
        }
    }
    payload = json.dumps(payload)
    print("Fetching cybexCount for "+data+"...")

    # NOTE: The backend cannot instantaneously calculate and return count
    # information. Often, it takes several checks before the backend has
    # completed calculations and returns valid data. Until this result is
    # computed, the backend returns "check back later". To handle this,
    # this function repeatedly makes requests to check calculation status.
    # The event object is used to cause the thread to wait for a few
    # seconds in between each repeated request, to mitigate server load.
    # Each request has timeouts that define the upper limit of how long 
    # it will wait for a valid response. Once a valid response is returned
    # the data is read and added to the graph.

    valid = False # Flag to be set when valid api response is returned
    # counter used for debugging, to track # of iterative request attempts
    count = 1
    while not valid:
        print("attempt " + str(count)+ ": requesting cybexCount "+ data +"...")
        count +=1
        try:
            # request timeout tuple is (connection timeout, read timeout)
            r = requests.post(url, headers=headers, data=payload, timeout=(3.05, 30))
        except requests.exceptions.ConnectTimeout:
            print("Couldn't connect to CYBEX, timed out.")
            return -1
        except requests.exceptions.ReadTimeout:
            print("Timed out when attempting to read cybexCount")
            return 0
        try:
            res = json.loads(r.text)
            if "data" in res:
                # t.cancel()
                valid = True
            else:
                event.wait(5)
        except json.decoder.JSONDecodeError as e:
            print("Could not decode JSON in response for " + data,e)
            #print(res)

    # Next, query malicious count...
    
    #dataMal = {Ntype1: data1, "from": "2019/8/30 00:00",
    #           "to": "2020/4/23 6:00am", "tzname": "US/Pacific"}
    payloadMal = {
        "type": "count", 
        "data" : {
            "sub_type": ntype_processed, 
            "data": data,
            "category": "malicious",
            "context": "all",
            "last": "1Y"
        }
    }
    payloadMal = json.dumps(payloadMal)
    print("Fetching cybexCountMalicious for "+data+"...")

    valid = False # Flag to be set when valid api response is returned
    count = 1
    while not valid:
        print("attempt " + str(count)+ ": requesting cybexMaliciousCount "+ data +"...")
        count+=1
        try:
            rMal = requests.post(url, headers=headers, data=payloadMal, timeout=(3.05, 30))
        except requests.exceptions.ConnectTimeout:
            print("Couldn't connect to CYBEX, timed out.")
            return -1
        except requests.exceptions.ReadTimeout:
            print("Timed out when attempting to read cybexMaliciousCount")
            return 0
        try:
            #print(rMal.text)
            resMal = json.loads(rMal.text)
            # if resMal["status"] is not "processing":
            if "data" in resMal:
                # t.cancel()
                valid = True
            else:
                event.wait(5)
        except json.decoder.JSONDecodeError as e:
            print("Could not decode JSON in response for " + data,e)
            #print(resMal)

    num_benign = res["data"]
    num_mal = resMal["data"]
    status = insertCybexCount(num_benign,num_mal,graph,data,ntype)
    # return jsonify({"insert status" : status})
    return status

def cybexRelatedHandler(ntype, data, graph, user, num_pages = 10):
    """Queries CYBEX for related IOCs and inserts them into the graph.

    Takes the given IOC data and queries CYBEX for all related IOCs (as 
    captured in related CYBEX event data). The returned IOCs are then 
    processed and inserted into the graph.

    Note that the order and results of the pages varies for each query.
    There is also sometimes duplicate data across different pages, but
    this is handled immediately and duplicates are removed. Future work
    may be done to order the pages that are returned by the underlying
    CYBEX query, such as ordering the pages in order of their contents'
    threatRank.

    Args:
        ntype (string): The IOC type of the originating node
        data: The data value of the originating node
        graph (py2neo.database.Graph): The graph object for the current graph
        user (django.contrib.auth.models.User): The current user making the 
            request
        num_pages (int): The desired number of response pages. CYBEX often
            has large numbers of pages that can be returned for a given piece
            of data. This value serves to cap the number of pages the query
            waits for before processing and adding data to the graph. Defaults
            to 10.

    Returns:
        int: 1 if successful

    """

    #TODO: Modify timeout/execption handling and returns
    # process the IOC type to ensure it matches the string the backend expects
    ntype_processed = replaceType(ntype)
    # The url to be used for the query to the CYBEX API
    url = "https://cybex-api.cse.unr.edu:5000/query"
    # Retrieve the token of the current user. This is stored in the django
    # user profile model and is created by the backend upon user creation.
    # The token is required for authenticating the request
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json', 'Authorization' : 'Bearer ' + user_token}
    # Initialize page count for iterating through response pages. Each page is
    # queried independently.
    count = 1
    r = None

    # Hash table (dict) to solve multithreading insertion duplicate issue.
    # The results of each response page are stored here, excluding duplicates
    insertions_to_make = {}

    ## Start of multithreading
    # Starts individual threads for querying each page of related IOC data
    thread_list = []
     #NOTE: Perhaphs replace below with more advanced stop condition
     # Currently is based on defined num_pages page limit
    for count in range(num_pages):
        thread = threading.Thread(target=threadedLoop_cybexRelatedHandler, args=(count, ntype_processed, data, graph, headers, url, insertions_to_make))
        thread_list.append(thread)
    for thread in thread_list:
        thread.start()
    for thread in thread_list:
        thread.join()
    ## End of multithreading

    # Iterate through all entries now populated in insertions_to_make dict
    # and create each relationship. This inserts each item into graph database
    for key, rel in insertions_to_make.items():
        graph.create(rel)

    return 1


def threadedLoop_cybexRelatedHandler(count, ntype_processed, data, graph, headers, url, insertions_to_make):
    """Helper function for cybexRelatedHandler. Handles cybexRelated requests.

    This function sends and receives a single page for a single cybexRelated
    query. It then calls insertRelatedAttributes() to insert the response 
    data into the neo4j graph database. Only meant to be called by 
    cybexRelatedHandler().

    """
    print(f"Page count: {count}")
    # construct the data object to be passed to post request
    payload = {
        "type": "related", # specify we want to return related IOC data
        "data": {
            "sub_type": ntype_processed,
            "data": data,
            "return_type": "attribute",
            "summary" : True,
            "page": count
        }
    }
    #TODO: make sure ipv4 works for ip (replaceType())

    payload = json.dumps(payload) # data is jsonified request
    print(f"data: {payload}")

    try:
        with requests.post(url, headers=headers, data=payload, timeout=(3.05, 20)) as r:
            try:
                res = json.loads(r.text)
                print(f"res: {res}")
                # Use response data to now insert nodes into graph database
                if "data" in res:
                    status = insertRelatedAttributes(res, graph, data, ntype_processed, insertions_to_make)
                else: # Report response not ready yet or doesn't exist for this page
                    print("Unable to get report response for page " + str(count) + " for " + str(data))
            except TypeError as e:
                print("Error inserting " + data + " into the graph:\n",e)
    except requests.exceptions.ConnectTimeout:
        print("Couldn't connect to CYBEX, timed out.")
        return -1
    except requests.exceptions.ReadTimeout:
        print("Timed out when attempting to read from CYBEX for " + data + " page " + str(count))
        return 0


# Description: Gets the CYBEX orgid of the current user
# Parameters: <object>user - Object representing the user
# Returns: Response status
# Author: Adam Cassell
def get_orgid(user):
    # TODO: return result of user's orgid query instead of hardcode
    return "test_org"
    
# Description: Posts user event data to CYBEX
# Parameters:   <object>data - the request data
#               <object>user - Object representing the user
# Returns: Response status
# Author: Adam Cassell
def send_to_cybex(data, user):
    # file is retreived from data object passed in from js
    # this reads the file in binary mode, which is recommended
    files = {'file':  data['file']}
    data.pop('file', None) # take file key out of data dict
    
    # Code to retrieve user orgid will go below
    # populate rest of data fields that don't come
    # from user input:
    data["orgid"] = get_orgid(user)
    data["typetag"] = 'test_json'
    data["name"] = 'frontend_input'

    url = "https://cybex-api.cse.unr.edu:5000/raw"
    user_token = user.profile.cybex_token
    headers = {"Authorization": user_token}
    with requests.post(url, files=files,
                 headers=headers, data=data) as r:
        print(r.text)
        if r.status_code >= 400:
            print((
                f"error posting. "
                f"status_code = '{r.status_code}', "
                f"API response = '{r.content.decode()}'"))
            raise Exception

        r.close() # redundant?
        return 1
