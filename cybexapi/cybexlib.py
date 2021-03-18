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


def pull_ip_src():

    ip_list = []

    with open('data/ti.json') as f:
        data = json.load(f)

        for entry in data['response']['Attribute']:
            if (entry['type'] == "ip-src"):
                ip_list.append(entry['value'])

    return ip_list


def insertCybex(data, graph, value):

    c = Node("CybexCount", data=data)
    ip_node = graph.nodes.match(data=value).first()
    c_node = graph.nodes.match("CybexCount", data=data).first()

    if(c_node):
        rel = Relationship(ip_node, "HAS_OCCURED", c_node)
        graph.create(rel)
        print("Existing CybexCount node linked")
    else:
        graph.create(c)
        rel = Relationship(ip_node, "HAS_OCCURED", c)
        graph.create(rel)
        print("New CybexCount node created and linked")

    return 1


def insertRelated(data, graph, value):

    c = Node("CybexRelated", data=data)
    ip_node = graph.nodes.match(data=value).first()
    c_node = graph.nodes.match("CybexRelated", data=data).first()

    if(c_node):
        rel = Relationship(ip_node, "HAS_OCCURED", c_node)
        graph.create(rel)
        print("Existing CybexRelated node linked")
    else:
        graph.create(c)
        rel = Relationship(ip_node, "HAS_OCCURED", c)
        graph.create(rel)
        print("New CybexRelated node created and linked")

    return 1

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
    # iterate over all related attributes..
    for attr, val in data["data"].items():
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
            for each in val:
                #     valString = valString + str(each) + ','
                # valString = valString[:-1] # remove trailing comma
                # #nodeData = attr + ": " + valString # currently only using value
                # nodeData = valString
                nodeData = each
                c = Node(attr, data=nodeData)
                c["source"] = "cybex"
                ip_node = graph.nodes.match(data=value).first()
                c_node = graph.nodes.match(attr, data=nodeData).first()

                if(c_node):
                    if (ip_node != c_node):
                        rel = Relationship(ip_node, "CYBEX", c_node)
                        #rel['color'] = 'rgb(255,255,255)'
                        #graph.create(rel)
                        insertions_to_make[nodeData+"_r"] = rel
                        print("Existing CybexRelated node linked")
                    else:
                        print("Related node is same as origin node. Skipped.")
                else:
                    #graph.create(c)
                    #insertions_to_make[str(nodeData)] = c
                    rel = Relationship(ip_node, "CYBEX", c)
                    #rel['color'] = 'rgb(255,255,255)'
                    #graph.create(rel)
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

def cybexRelatedHandler(Ntype, data1, graph, user):
    #TODO: Modify timeout/execption handling and returns
    
    #graph = connect2graph()
    #req = request.get_json()
    #Ntype = str(req['Ntype'])
    Ntype1 = replaceType(Ntype)
    #data1 = req['value']
    #print(req)
    #url = "http://cybexp1.acs.unr.edu:5000/api/v1.0/related/attribute/summary"
    url = "https://cybex-api.cse.unr.edu:5000/query"
    user_token = user.profile.cybex_token
    # print(f"user: {user}")
    headers = {'content-type': 'application/json', 'Authorization' : 'Bearer ' + user_token}
    #data = { Ntype1 : data1, "from" : "2019/8/30 00:00", "to" : "2019/12/5 6:00am", "tzname" : "US/Pacific" }
    count = 1
    r = None


    #TODO REPLACE below with real stop condition and/or max pagination

    # Hash table (dict) to solve multithreading insertion duplicate issue:
    insertions_to_make = {}

    ## Start of threaded version
    thread_list = []
    for count in range(10):
        thread = threading.Thread(target=threadedLoop_cybexRelatedHandler, args=(count, Ntype1, data1, graph, headers, url, insertions_to_make))
        thread_list.append(thread)
    for thread in thread_list:
        thread.start()
    for thread in thread_list:
        thread.join()
    ## End of threaded version

    # print(insertions_to_make)

    for key, rel in insertions_to_make.items():
        graph.create(rel)

    ## Start of non-threaded version
    # while r != "[]" and count <= 10:
    #     print(f"Count: {count}")
    #     data = {
    #         "type": "related",
    #         "data": {
    #             "sub_type": Ntype1, # make sure ipv4 works for ip (replaceType())
    #             "data": data1,
    #             "return_type": "attribute",
    #             "summary" : True,
    #             "page": count
    #         }
    #     }
        

    #     data = json.dumps(data) # data is jsonified request
    #     print(f"data: {data}")

    #     r = requests.post(url, headers=headers, data=data)
    #     res = json.loads(r.text)
    #     print(f"res: {res}")
    #     count += 1

    #     try:
    #         #status = insertRelated(str(res), graph, data1)
    #         status = insertRelatedAttributes(res, graph, data1,Ntype1)

    #     except:
    #         return 1
    ## End of non-threaded version


    return 1


def threadedLoop_cybexRelatedHandler(count, Ntype1, data1, graph, headers, url, insertions_to_make):
    print(f"Count: {count}")
    data = {
        "type": "related",
        "data": {
            "sub_type": Ntype1, # make sure ipv4 works for ip (replaceType())
            "data": data1,
            "return_type": "attribute",
            "summary" : True,
            "page": count
        }
    }
    

    data = json.dumps(data) # data is jsonified request
    print(f"data: {data}")

    try:
        r = requests.post(url, headers=headers, data=data, timeout=(3.05, 10))
    except requests.exceptions.ConnectTimeout:
        print("Couldn't connect to CYBEX, timed out.")
        return -1
    except requests.exceptions.ReadTimeout:
        print("Timed out when attempting to read from CYBEX")
        return 0
    res = json.loads(r.text)
    print(f"res: {res}")

    try:
        #status = insertRelated(str(res), graph, data1)
        status = insertRelatedAttributes(res, graph, data1,Ntype1, insertions_to_make)

    except:
        return -1

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

    if left_count > 1 and right_count > 1:
        entries = file_string.splitlines()
    else:
        entries = [file_string]
    for entry in entries:
        #print(entry)
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
    required_keys = ["eventid","timestamp","session","message",
        "src_ip","sensor"]
    for entry in entries:
        if not dictionary_validator(entry,required_keys):
            raise TypeError("The supplied file did not pass validation. "
                + " Ensure that the contents match a supported CYBEX-P schema.") 

    # If all entries are valid, then submit all entries individually...

    # Code to retrieve user orgid will go below
    # populate rest of data fields that don't come from user input:
    data.pop('file', None) # take file key out of data dict
    data["orgid"] = 'test_org'
    data["typetag"] = 'test_json'
    data["name"] = 'frontend_input'
    for entry in entries:
        files = {'file': bytes(entry, 'utf-8')}
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