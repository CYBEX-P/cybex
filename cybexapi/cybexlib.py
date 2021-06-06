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
import ast
import requests
from django.conf import settings
from threading import Timer
from cybexapi.shodanSearch import insert_ports
import threading
import time
import random
from dateutil.parser import parse

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
                # Note: nodeData is a list of length 2, with the first index
                # being the node's value and the second index being a list
                # that defines associated event data. This is the event data
                # that this related IOC was associated with
                event_details = nodeData[1]
                # items in event_details can be objects, attributes, or events
                # create label to be used to describe relationship
                separator = ','
                event_string = "CYBEX:" + separator.join(event_details)

                # Create a temporary node with the given data for comparsions
                c = Node(attr, data=nodeData[0])
                c["source"] = "cybex"
                # Get the existing node from which this query originates
                original_node = graph.nodes.match(data=value).first()
                # see if a node already exists with the new data
                c_node = graph.nodes.match(attr, data=nodeData[0]).first()
                
                # if c_node is true, an existing node matched the given data
                if(c_node):
                    # if the new node is different from the originating node..
                    if (original_node != c_node):
                        # create relationshop object from originating node to
                        # the matching existing node 
                        rel = Relationship(original_node, event_string, c_node)
                        # Add relationship object to key of dict that
                        # corresponds to the appropriate node. Note that the
                        # key is the data value of the node, represented as a
                        # string, with an '_r' appended. This is done to cast
                        # all node values as strings for easy indexing of dict
                        insertions_to_make[nodeData[0]+"_r"] = rel
                        print("Existing CybexRelated node linked")
                    else:
                        print("Related node is same as origin node. Skipped.")
                else:
                    # no existing node with given data is found...
                    # create relationship object from originating node to the
                    # newly created node
                    rel = Relationship(original_node, event_string, c)
                    insertions_to_make[nodeData[0] +"_r"] = rel
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
def cybexCountHandler(ntype, data, graph, user, event, from_date, to_date, timezone):
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

    # Format dates
    from_date = from_date.replace("-","/")
    to_date = to_date.replace("-","/")
    timezone= timezone.replace("-","/")

    # construct the data object to be passed to post request
    payload = {
        "type": "count", #specify that we want count data
        "data" : {
            "sub_type": ntype_processed, 
            "data": data,
            "category": "benign",
            "context": "all",
            "from": from_date, 
            "to": to_date,
            "tzname": timezone
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
            "from": from_date, 
            "to": to_date,
            "tzname": timezone
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

def cybexRelatedHandler(ntype, data, graph, user, from_date, to_date, timezone, num_pages = 10):
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
        thread = threading.Thread(target=threadedLoop_cybexRelatedHandler, 
            args=(count, ntype_processed, data, graph, headers, url, 
            insertions_to_make, from_date, to_date, timezone))
        thread_list.append(thread)
    for thread in thread_list:
        thread.start()
        # thread.start()
        # time.sleep(2)
    for thread in thread_list:
        thread.join()
    ## End of multithreading

    # Iterate through all entries now populated in insertions_to_make dict
    # and create each relationship. This inserts each item into graph database
    for key, rel in insertions_to_make.items():
        graph.create(rel)

    return 1


def threadedLoop_cybexRelatedHandler(count, ntype_processed, data, graph, headers, url, insertions_to_make, from_date, to_date, timezone):
    """Helper function for cybexRelatedHandler. Handles cybexRelated requests.

    This function sends and receives a single page for a single cybexRelated
    query. It then calls insertRelatedAttributes() to insert the response 
    data into the neo4j graph database. Only meant to be called by 
    cybexRelatedHandler().

    """
    print(f"Page count: {count}")

    # Format dates
    from_date = from_date.replace("-","/")
    to_date = to_date.replace("-","/")
    timezone= timezone.replace("-","/")

    # construct the data object to be passed to post request
    payload = {
        "type": "related", # specify we want to return related IOC data
        "data": {
            "sub_type": ntype_processed,
            "data": data,
            #"return_type": "attribute",
            "summary" : True,
            "summary_graph": True,
            "page": count,
            "from": from_date, 
            "to": to_date,
            "tzname": timezone
        }
    }
    #TODO: make sure ipv4 works for ip (replaceType())

    payload = json.dumps(payload) # data is jsonified request
    print(f"data: {payload}")

    valid = False # Flag that is set to true once a valid response has been recieved.
    retry_count = 3 # sets number of allowable timeouts before call stops retrying.
    while retry_count >= 1 and not valid:
        try:
            with requests.post(url, headers=headers, data=payload, timeout=(3.05, 60)) as r:
                try:
                    res = json.loads(r.text)
                    print(f"res: {res}")
                    # Use response data to now insert nodes into graph database
                    if "data" in res:
                        # if status: 'processing' is part of response, then
                        # that means a valid response hasn't been reached yet
                        if not "status" in res["data"]:
                            valid = True
                        status = insertRelatedAttributes(res, graph, data, ntype_processed, insertions_to_make)
                    else: # Report response not ready yet or doesn't exist for this page
                        print("Unable to get report response for page " + str(count) + " for " + str(data))
                except TypeError as e:
                    print("Error inserting " + data + " into the graph:\n",e)
                retry_count = 0
        except requests.exceptions.ConnectTimeout:
            retry_count -= 1
            print(f"Retry count: {retry_count} Couldn't connect to CYBEX, timed out.")
            time.sleep(random.uniform(0.0,5.0)) # wait a random amount of time to balance concurrent requests
            #return -1
        except requests.exceptions.ReadTimeout:
            retry_count -= 1
            print(f"Retry count: {retry_count} Timed out when attempting to read from CYBEX for {data} page {count}")
            time.sleep(random.uniform(0.0,5.0)) # wait a random amount of time to balance concurrent requests
            #return 0


##############################################################################
# Functions for data upload to CYBEX-P from web app, including validation:
##############################################################################
    
# Author: Adam Cassell
def send_to_cybex(data, user):
    """Validates user event file uploads and posts to CYBEX.

    Note that the file is validated against the schema defined within
    the body of this function. Modify required_keys to customize.

    Args:
        data (dict): The request data
        user (models.User): The reqesting user

    Returns:
        int: 1 if successful
    
    Raises:
        TypeError: If any lines of submitted file are invalid JSON, or if 
            schema validation fails according to the configured requirements.
        Exception: If response status >= 400 upon attempting to post data.

    """
    # file is retreived from data object passed in from js
    # this reads the file in binary mode, which is recommended

    # These lines first decode file in default utf-8 from binary
    # in order to perform string validation on submitted file.
    file_contents = data['file']
    file_string = file_contents.read().decode()
    left_count = file_string.count('{')
    right_count = file_string.count('}')

    entryList = []

    if left_count > 1 and right_count > 1:

        # entries = file_string.splitlines()
        entries = file_string
        currentList = "" 

        # Get indices of '{' and '}'
        openIndexList = []
        closeIndexList = []
        
        for index, entry in enumerate(entries):
            if entry == '{':
                openIndexList.append(index)
            if entry == '}':
                closeIndexList.append(index)
       
        # Grabbing all JSON information between each opening
        # and closing brace
        for i in range(0, len(openIndexList)):
            for index in range(openIndexList[i], closeIndexList[i] + 1):
                entry = entries[index]
                currentList = currentList + entry
            entryList.append(currentList)
            currentList = ""


    else:
        # entries = [file_string]
        entryList.append(file_string)
    
    for entry in entryList:
        try:
            entry = json.loads(entry)
        except json.decoder.JSONDecodeError as err:
            print(f"Invalid JSON: {err}") # in case json is invalid
            raise TypeError("The supplied file did not pass validation. "
                + "JSON on one or more lines is invalid.")


    # First, validate all entries:
    # NOTE: Requiring all of the following fields failed on real-world cowrie
    #   output. The less strict key requirement below is max that passes.
    # required_keys = ["eventid","timestamp","session","src_port","message",
    #     "system","isError","src_ip","dst_port","dst_ip","sensor"]
    
    cowrie_required_keys = [
        ["eventid","timestamp","session","message",
            "src_ip","sensor"],
        ["timestamp","message","system","height","src_ip","width",
            "isError","session","sensor"],
        ["username","timestamp","message","system","isError","src_ip",
            "session","password","sensor"],
        ["timestamp","message","system","isError","src_ip","duration",
            "session","sensor"],
        ["timestamp","sensor","system","isError","src_ip","session","dst_port",
            "dst_ip","data","message"],
        ["src_ip","session","shasum","url","timestamp","outfile","sensor",
            "message"],
        ["username","timestamp","message","system","isError","src_ip","session",
            "password","sensor"],
        ["macCS","timestamp","session","kexAlgs","keyAlgs","message","system",
            "isError","src_ip","version","compCS","sensor","encCS"],
        ["username","timestamp","message","fingerprint","system",
            "isError","src_ip","session","input","sensor"],
        ["timestamp","message","ttylog","system","isError","src_ip","session","sensor"],
        ["timestamp","sessions","message","src_port","system","isError",
            "src_ip","dst_port","dst_ip","sensor"],
        ["timestamp","session","src_port","message","system","isError","src_ip",
            "dst_port","dst_ip","sensor"],
        ["timestamp","message","ttylog","system","src_ip","session","duration",
            "sensor","isError","size"],
        ["timestamp","message","system","isError","src_ip","session","input","sensor"]
    ]
    
    # Can also just put all required keys for phishtank
    # above, and just has to pass the number of cases that is 
    # the same as the length of how many JSON objects
    # So if data has only one JSON object it only has to pass one case

    # phishtank_required_keys = [
    # ]

    all_pass_count = 0
    # have to change below to work with Phishtank
    # if type == "cowrie":
    for required_keys in cowrie_required_keys:      
        
        # One case has to pass
        if all_pass_count > 0:
            break

        for entry in entryList:
            # If dictionary has all required keys, file is good
            if dictionary_validator(entry,required_keys):
                all_pass_count = all_pass_count + 1
                # break
        
    
    # If no cases pass, throw error
    if all_pass_count < len(entryList):
        raise TypeError("The supplied file did not pass validation. "
                + " Ensure that the contents match a supported CYBEX-P schema.") 
    else:
        print ("VALIDATION PASS")
 


    # If all entries are valid, then submit all entries individually...
        
    # Code to retrieve user orgid will go below
    # populate rest of data fields that don't come from user input:
    data.pop('file', None) # take file key out of data dict
    # data["orgid"] = 'test_org' # Now passed in by user
    data["typetag"] = 'test_json'
    data["name"] = 'frontend_input'
    for entry in entryList:
        files = {'file': bytes(entry, 'utf-8')}
        url = "https://cybex-api.cse.unr.edu:5000/raw"
        user_token = user.profile.cybex_token
        headers = {"Authorization": 'Bearer ' + user_token}
        with requests.post(url, files=files,
                    headers=headers, data=data) as r:
            print(r.text)
            if r.status_code >= 400:
                print((
                    f"error posting. "
                    f"status_code = '{r.status_code}', "
                    f"API response = '{r.content.decode()}'"))
                raise Exception

            r.close()
            return 1

def check_key(key,dictionary):
    """Returns whether key is in dictionary"""
    if key not in dictionary:
        print(key + " not found in dictionary")
        return False
    else:
        return True

def dictionary_validator(dictionary,required_keys):
    """Returns whether dictionary has all required keys"""
    # The following only passes the file if in strict cowrie format
    for key in required_keys:
        if not check_key(key, dictionary):
            return False
    return True
