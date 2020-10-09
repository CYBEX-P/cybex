from py2neo import Graph, Node, Relationship
from cybexapi.exportDB import bucket
from cybexapi.api import *
import json
import requests
from django.conf import settings
from threading import Timer


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
    return 1

# Description: Attaches nodes to an object for all related attributes queried from Cybex
# Parameters: <string>data - JSON response string from the Related Attribute Summary API call
#             <object>graph - The current graph
#             <string>value - JSON data for the originating node
# Returns: 1 if successful
# Author: Adam Cassell


def insertRelatedAttributes(data, graph, value):
    # Converts string to proper JSON using "" instead of ''
    data = data.replace("'", '"',)
    dataDict = json.loads(data)  # convert json string to dict
    # iterate over all related attributes..
    for attr, val in dataDict["data"].items():
        attr = bucket(attr)
        valString = ""
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
                    graph.create(rel)
                    print("Existing CybexRelated node linked")
                else:
                    print("Related node is same as origin node. Skipped.")
            else:
                graph.create(c)
                rel = Relationship(ip_node, "CYBEX", c)
                #rel['color'] = 'rgb(255,255,255)'
                graph.create(rel)
                print("New CybexRelated node created and linked")

    return 1


def replaceType(value):
    if value == "Email":
        return "email_addr"
    elif value == "Host":
        return "hostname"
    elif value == "URL":
        return "uri"
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


def cybexCountHandler(Ntype, data1):
    # graph = connect2graph()
    Ntype1 = replaceType(Ntype)

    # test_url = "http://cybex-api.cse.unr.edu:5000/hello"
    # test_r = requests.get(test_url)
    # print(test_r.text)

    # First, query total count
    #url = "http://cybexp1.acs.unr.edu:5000/api/v1.0/count"
    #url = "http://localhost:5001/query"
    url = "http://cybex-api.cse.unr.edu:5000/query"
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer: xxxxxx'}
    # data = {Ntype1: data1, "from": "2019/8/30 00:00",
    #         "to": "2020/3/1 6:00am", "tzname": "US/Pacific"}
    def raise_timeout():
        raise requests.exceptions.Timeout("Count query timed out.")

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
        print("Fetching cybexCount...")
        valid = False # Flag to be set when valid api response is returned
        api_timeout = False
        t = Timer(10.0, raise_timeout)
        t.start()      
        while not valid:
            r = requests.post(url, headers=headers, data=data)
            res = json.loads(r.text)
            if res.status is not "processing":
                t.cancel()
                valid = True
            # print(res)

        # Next, query malicious count
        #urlMal = "http://cybexp1.acs.unr.edu:5000/api/v1.0/count/malicious"
        #urlMal = "http://localhost:5001/query"
        urlMal = "http://cybex-api.cse.unr.edu:5000/query"
        headersMal = {'content-type': 'application/json',
                    'Authorization': 'Bearer xxxxx'}
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
        print("Fetching cybexCountMalicious...")
        valid = False # Flag to be set when valid api response is returned
        api_timeout = False
        t = Timer(10.0, raise_timeout)
        t.start()
        while not valid:
            rMal = requests.post(urlMal, headers=headersMal, data=dataMal)
            resMal = json.loads(rMal.text)
            #print(resMal)
            if resMal.status is not "processing":
                t.cancel()
                valid = True
    except:
        return 0

    try:
        numOccur = res["data"]
        numMal = resMal["data"]
        # status = insertCybex(numOccur, graph, data1)
        status = insertCybexCount(numOccur,numMal,graph,data1,Ntype)
        # return jsonify({"insert status" : status})
        return status

    except:
        print("error")
        return 0
