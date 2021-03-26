from py2neo import Graph, Node, Relationship
from cybexapi.exportDB import bucket
from cybexapi.api import *
import json
import requests
from django.conf import settings
from threading import Timer
from cybexapi.shodanSearch import insert_ports
import threading


def pull_ip_src():

    ip_list = []

    with open('data/ti.json') as f:
        data = json.load(f)

        for entry in data['response']['Attribute']:
            if (entry['type'] == "ip-src"):
                ip_list.append(entry['value'])

    return ip_list


# Deprecated
# def insertCybex(data, graph, value):

#     c = Node("CybexCount", data=data)
#     ip_node = graph.nodes.match(data=value).first()
#     c_node = graph.nodes.match("CybexCount", data=data).first()

#     if(c_node):
#         rel = Relationship(ip_node, "HAS_OCCURED", c_node)
#         graph.create(rel)
#         print("Existing CybexCount node linked")
#     else:
#         graph.create(c)
#         rel = Relationship(ip_node, "HAS_OCCURED", c)
#         graph.create(rel)
#         print("New CybexCount node created and linked")

#     return 1


# def insertRelated(data, graph, value):

#     c = Node("CybexRelated", data=data)
#     ip_node = graph.nodes.match(data=value).first()
#     c_node = graph.nodes.match("CybexRelated", data=data).first()

#     if(c_node):
#         rel = Relationship(ip_node, "HAS_OCCURED", c_node)
#         graph.create(rel)
#         print("Existing CybexRelated node linked")
#     else:
#         graph.create(c)
#         rel = Relationship(ip_node, "HAS_OCCURED", c)
#         graph.create(rel)
#         print("New CybexRelated node created and linked")

#     return 1

# Description: Adds Cybex Count and Malicious Count to node data
# Parameters: <int>numOccur - Cybex Count query response
#             <int>numMal - Cybex Count Malicious query response
#             <object>graph - The current graph
#             <string>Ntype - The type of the originating node
#             <string>value - JSON data for the originating node
# Returns: 1 if successful
# Author: Adam Cassell


def insertCybexCount(numOccur, numMal, graph, value, nType):
    ip_node = graph.nodes.match(nType, data=value).first()
    if(ip_node):
        ip_node["count"] = numOccur
        ip_node["countMal"] = numMal
        graph.push(ip_node)
        print("CybexCount added to node")
    else:
        print("Error adding CybexCount")
        return -1
    return 1

# Description: Attaches nodes to an object for all related attributes queried from Cybex
# Parameters: <string>data - JSON response string from the Related Attribute Summary API call
#             <object>graph - The current graph
#             <string>value - JSON data for the originating node
#             <string>originalType - type of originating node
# Returns: 0 if successful
# Author: Adam Cassell

def insertRelatedAttributes(data, graph, value, originalType, insertions_to_make):
    """Adds related attributes queried from CYBEX to insertions_to_make dict

    Args:
        data (string): JSON response string from the Related Attribute Summary API call
        graph (py2neo.database.Graph): The graph object for the current graph
        value (string): JSON data for the originating node 
        originalType (string): IOC type of originating node
        insertions_to_make (dict): dictionary with each key representing each
            node to add to graph. Each value is the Relationship object
            that will be later processed to insert the relationship into the
            neo4j graph

    Returns:
        0 if successful
    """
    # iterate over all related attributes..
    for attr, val in data["data"].items():
        # format IOC type labels to be most human-readable
        attr = bucket(attr)
        originalType = bucket(originalType)
        valString = ""
        # Only connect ports to graph if the original node is of type 'IP'
        # Doesn't make sense to add ports to a url node, for example
        if attr == "Ports":
            if originalType == "IP" or originalType == "Subnet":
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

    return 0


def replaceType(value):
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

# Description: Handler for cybexCount() and also designed to be called seperately
# Parameters: <string>Ntype - The type of the originating node
#             <string>data1 - JSON data for the originating node
# Returns: 1 if successful
# Author: Adam Cassell
# TODO
# Use django.settings to get keys and move URLS to settings as well.


def cybexCountHandler(Ntype, data1, graph, user):
    # graph = connect2graph()
    Ntype1 = replaceType(Ntype)

    # test_url = "http://cybex-api.cse.unr.edu:5000/hello"
    # test_r = requests.get(test_url)
    # print(test_r.text)

    # First, query total count
    #url = "http://cybexp1.acs.unr.edu:5000/api/v1.0/count"
    #url = "http://localhost:5001/query"
    url = "https://cybex-api.cse.unr.edu:5000/query"
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}
    # data = {Ntype1: data1, "from": "2019/8/30 00:00",
    #         "to": "2020/3/1 6:00am", "tzname": "US/Pacific"}
    def raise_timeout():
        #raise requests.exceptions.Timeout("Count query timed out.")
        print("*****TIMED OUT*****")
        return 0

    try:
        data = {
            "type": "count", 
            "data" : {
                "sub_type": Ntype1, 
                "data": data1,
                "category": "all",
                "context": "all",
                "last": "1Y"
            }
        }
        data = json.dumps(data)
        print("Fetching cybexCount for "+data1+"...")
        valid = False # Flag to be set when valid api response is returned
        api_timeout = False
        t = Timer(30.0, raise_timeout)
        t.start()      
        while not valid:
            print("requesting "+ data1 +"...")
            try:
                # request timeout tuple is (connection timeout, read timeout)
                r = requests.post(url, headers=headers, data=data, timeout=(3.05, 30))
            except requests.exceptions.ConnectTimeout:
                print("Couldn't connect to CYBEX, timed out.")
                return -1
            except requests.exceptions.ReadTimeout:
                print("Timed out when attempting to read cybexCount")
                return 0
            res = json.loads(r.text)
            if "status" not in res:
                t.cancel()
                valid = True

        # Handle situation where timeout occurs on query:
        if r.status_code == 504:
            raise_timeout()
        # Next, query malicious count
        #urlMal = "http://cybexp1.acs.unr.edu:5000/api/v1.0/count/malicious"
        #urlMal = "http://localhost:5001/query"
        # urlMal = "https://cybex-api.cse.unr.edu:5000/query"
        # headersMal = {'content-type': 'application/json',
        #             'Authorization': 'Bearer xxxxx'}
        #dataMal = {Ntype1: data1, "from": "2019/8/30 00:00",
        #           "to": "2020/4/23 6:00am", "tzname": "US/Pacific"}
        dataMal = {
            "type": "count", 
            "data" : {
                "sub_type": Ntype1, 
                "data": data1,
                "category": "malicious",
                "context": "all",
                "last": "1Y"
            }
        }
        dataMal = json.dumps(dataMal)
        print("Fetching cybexCountMalicious for "+data1+"...")
        valid = False # Flag to be set when valid api response is returned
        api_timeout = False
        t = Timer(30.0, raise_timeout)
        t.start()
        while not valid:
            try:
                rMal = requests.post(url, headers=headers, data=dataMal, timeout=(3.05, 30))
            except requests.exceptions.ConnectTimeout:
                print("Couldn't connect to CYBEX, timed out.")
                return -1
            except requests.exceptions.ReadTimeout:
                print("Timed out when attempting to read cybexMaliciousCount")
                return 0
            resMal = json.loads(rMal.text)
            # if resMal["status"] is not "processing":
            if "status" not in resMal:
                t.cancel()
                valid = True

    except requests.exceptions.Timeout as e:
        print(e)
        return 0

    numOccur = res["data"]
    numMal = resMal["data"]
    # status = insertCybex(numOccur, graph, data1)
    status = insertCybexCount(numOccur,numMal,graph,data1,Ntype)
    # return jsonify({"insert status" : status})
    return status

def cybexRelatedHandler(ntype, data, graph, user, num_pages = 10):
    """Queries CYBEX for related IOCs and inserts them into the graph

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
        1 if successful

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
    """Helper function for cybexRelatedHandler. Executes cybexRelated requests

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
        with requests.post(url, headers=headers, data=payload, timeout=(3.05, 10)) as r:
            res = json.loads(r.text)
            print(f"res: {res}")
            try:
                # Use response data to now insert nodes into graph database
                status = insertRelatedAttributes(res, graph, data, ntype_processed, insertions_to_make)
            except TypeError as e:
                print("Error inserting " + data + " into the graph:\n",e)
    except requests.exceptions.ConnectTimeout:
        print("Couldn't connect to CYBEX, timed out.")
        return -1
    except requests.exceptions.ReadTimeout:
        print("Timed out when attempting to read from CYBEX")
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
