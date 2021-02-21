from django.shortcuts import render
from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse
from rest_framework import status
import os
from datetime import datetime
from django.conf import settings
from py2neo import Graph
import json
from cybexapi.exportDB import processExport, export
from cybexapi.runner import insertNode, insertHostname
from cybexapi.gip import asn_insert, ASN, geoip, geoip_insert
from cybexapi.whoisXML import whois, insertWhois
from cybexapi.enrichments import insert_domain_and_user, insert_netblock, insert_domain, resolveHost, getNameservers, getRegistrar, getMailServer
from cybexapi.cybexlib import cybexCountHandler, cybexRelatedHandler, pull_ip_src, send_to_cybex
from cybexapi.shodanSearch import shodan_lookup, insert_ports
from cybexapi.import_json import import_json
from cybexapi.delete_node import delete_node
from cybexapi.positions import update_positions
from cybexapi.directory import get_contents
import json
from cybexapi.wipe_db import wipeDB
import pandas as pd
import time
import threading


# TODO
# This needs more error checking and probably a more elegent check to see if the db is available
def connect2graph(user, passw, addr, bolt_port):
    URI = "bolt://" + addr + ":" + str(bolt_port)

    graph = Graph(URI, auth=(user, passw))
    return graph

# TODO
# Move to library file
def enrichLocalNode(enrich_type, value, node_type, graph, user=None):

    if(enrich_type == "asn"):
        a_results = ASN(value)
        status = asn_insert(a_results, graph)
        return json.dumps({"insert status": status})

    elif enrich_type == "gip":
        g_results = geoip(value)
        status = geoip_insert(g_results, graph)
        return json.dumps({"insert status": status})

    elif enrich_type == "hostname":
        status = insertHostname(value, graph)
        return json.dumps({"insert status": status})

    elif enrich_type == "whois":
        w_results = whois(value)
        status = insertWhois(w_results, graph, value)
        return json.dumps({"insert status": status})

    elif enrich_type == "deconstructEmail":
        status = insert_domain_and_user(value, graph)
        return json.dumps({"insert status": status})

    elif enrich_type == "netblock":
        status = insert_netblock(value, graph)
        return json.dumps({"insert status": status})

    elif enrich_type == "ports":
        results = shodan_lookup(value)
        status = insert_ports(results, graph, value)
        return json.dumps({"insert status": status})

    elif enrich_type == "resolveHost":
        status = resolveHost(value, graph)
        return json.dumps({"insert status": status})

    elif enrich_type == "nameservers":
        w_results = whois(value)
        status = getNameservers(w_results, graph, value)
        return json.dumps({"insert status": status})

    elif enrich_type == "registrar":
        w_results = whois(value)
        status = getRegistrar(w_results, graph, value)
        return json.dumps({"insert status": status})

    elif enrich_type == "mailservers":
        status = getMailServer(value, graph)
        return json.dumps({"insert status": status})

    elif enrich_type == "cybexCount":
            #status = insertCybexCount(value, graph)
            status = cybexCountHandler(node_type,value, graph, user)
            return json.dumps({"insert status" : status})

    elif enrich_type == "cybexRelated":
        #status = insertCybexCount(value, graph)
        status = cybexRelatedHandler(node_type,value, graph, user)
        return json.dumps({"insert status" : status})

    # elif enrich_type == "comment":
    #         # req = request.get_json()
    #         # Ntype = str(req['Ntype'])
    #         # value = str(req['value'])
    #         status = insertComment("test comment", graph, value, "Domain")
    #         return json.dumps({"insert status" : status})
    else:
        return "Invalid enrichment type. Try 'asn', 'gip', 'whois', or 'hostname'."

# TODO
# Move to library file
def insertLocalNode(node_type, value, graph):
    status = insertNode(node_type, value, graph)
    return status

class exportNeoDB(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        g = export(graph)
        # print(g)
        p = processExport(g)
        # print(p)
        return Response(p)

class insert(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, node_type=None, value=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        status = insertLocalNode(node_type, value, graph)
        
        if status == 1:
            return Response({"Status": "Success"})
        else:
            return Response({"Status": "Failed"})

class delete(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None, node_id=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        status = delete_node(node_id, graph)

        if status == 1:
            return Response({"Status": "Success"})
        else:
            return Response({"Status": "Failed"})
        

class enrichNode(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None, enrich_type=None, value=None, node_type=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        result = enrichLocalNode(enrich_type, value, node_type, graph)
        return Response(result)

class enrichNodePost(APIView):
    permission_classes = (IsAuthenticated, )
    
    def post(self, request, format=None, enrich_type=None):
        current_user = request.user
        data = request.data
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        result = enrichLocalNode(enrich_type, data["value"], data["Ntype"], graph, current_user)
        return Response(result)

class enrichURL(APIView):
    permission_classes = (IsAuthenticated, )
    
    def post(self, request, format=None, enrich_type=None):
        current_user = request.user
        data = request.data
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        status = insert_domain(data["value"], graph)
        return Response(status)


class macroCybex(APIView):
    permission_classes = (IsAuthenticated, )

    # Description: Runs the CYBEX-P Analysis Macro. Note: I have implemented a multithreading
    #               version to increase pooling rate. I have left the non-threaded version as well commented out.
    #               To run the seralized version, comment out the threaded version and uncomment the non-threaded version.
    # Parameters: <object>request - The user request
    #             <object>graph - The current graph
    # Returns: Response status
    # Author: Spencer Kase Rohlfing & (Someone else, sorry don't know who)
    def get(self, request, format=None):
        # start = time.time()

        current_user = request.user
        print(f"current user: {current_user}")
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)

        data = processExport(export(graph))
        nodes = data["Neo4j"][0][0]["nodes"]

        ## Start of threaded version part 1
        thread_list = []
        for node in nodes:
            thread = threading.Thread(target=self.threadedLoop_cybexRelated, args=(node,graph,current_user))
            thread_list.append(thread)
        for thread in thread_list:
            thread.start()
        for thread in thread_list:
            thread.join()
        ## End of threaded version

        # Now that new related IOCs have been added, query cybexCount
        # This is done all all nodes including the newly added ones
        # Re-process graph because new nodes have been added from part 1
        data = processExport(export(graph))
        nodes = data["Neo4j"][0][0]["nodes"]
        
        ## Start of threaded version part 2
        thread_list = []
        for node in nodes:
            thread = threading.Thread(target=self.threadedLoop_cybexCount, args=(node,graph,current_user))
            thread_list.append(thread)
        for thread in thread_list:
            thread.start()
        for thread in thread_list:
            thread.join()
        ## End of threaded version

        ## Start of non-threaded version
        # for node in nodes:
        #     value = node["properties"]["data"]
        #     nType = node["properties"]["type"]
        #     if nType == "URL" or nType == "Host" or nType == "Domain" or nType == "IP" or nType == "ASN" or nType == "filename":
        #         print("--> Querying cybexRelated IOCs for", value)
        #         enrichLocalNode('cybexRelated', value, nType, graph)
        #         print("Done with", str(value))

        # # Now that new related IOCs have been added, query cybexCount
        # # This is done all all nodes including the newly added ones
        # data = processExport(export(graph))
        # nodes = data["Neo4j"][0][0]["nodes"]
        # for node in nodes:
        #     value = node["properties"]["data"]
        #     nType = node["properties"]["type"]
        #     if nType == "URL" or nType == "Host" or nType == "Domain" or nType == "IP" or nType == "ASN" or nType == "filename":
        #         print("--> Querying cybexCounts for ", value)
        #         enrichLocalNode('cybexCount', value, nType, graph)
        #         print("Done with", str(value))
        ## End of non-threaded version

        ## This is used for tracking the performance speedup between seralized and threaded versions
        # end = time.time()
        # print(f"TIME: {end - start}")
        return Response(nodes)

    def threadedLoop_cybexRelated(self, node, graph, current_user):
        value = node["properties"]["data"]
        nType = node["properties"]["type"]
        if nType == "URL" or nType == "Host" or nType == "Domain" or nType == "IP" or nType == "ASN" or nType == "filename":
            print("--> Querying cybexRelated IOCs for", value)
            enrichLocalNode('cybexRelated', value, nType, graph, current_user)
            print("Done with", str(value))

    def threadedLoop_cybexCount(self, node, graph, current_user):
        value = node["properties"]["data"]
        nType = node["properties"]["type"]
        if nType == "URL" or nType == "Host" or nType == "Domain" or nType == "IP" or nType == "ASN" or nType == "filename":
            print("--> Querying cybexCounts for ", value)
            enrichLocalNode('cybexCount', value, nType, graph, current_user)
            print("Done with", str(value))

# TODO
# Move the bulk of code here to library file

class macro(APIView):
    permission_classes = (IsAuthenticated, )

    # Description: Runs the Phishing Investigation Macro. Note: I have implemented a multithreading
    #               version to increase pooling rate. I have left the non-threaded version as well commented out.
    #               To run the seralized version, comment out the threaded version and uncomment the non-threaded version.
    # Parameters: <object>request - The user request
    #             <object>graph - The current graph
    #             <string>subroutine - which macro to run. If value is None then run all macros
    # Returns: Response status
    # Author: Spencer Kase Rohlfing & (Someone else, sorry don't know who)
    def get(self, request, format=None, subroutine=None):
        # start = time.time()
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)

        data = processExport(export(graph))
        nodes = data["Neo4j"][0][0]["nodes"]

        if(subroutine=='all'):
            print("Running full phishing investigation macro")
        else:
            print(f"Running macro for subroutine: {subroutine}")
    
        ## Start of threaded version
        thread_list = []
        for node in nodes:
            thread = threading.Thread(target=self.threadedLoop, args=(node,graph,subroutine))
            thread_list.append(thread)
        for thread in thread_list:
            thread.start()
        for thread in thread_list:
            thread.join()
        ## End of threaded version

        ## Start of non-threaded version
        # for node in nodes:
        #     value = node["properties"]["data"]
        #     nType = node["properties"]["type"]
        #     print("--> Enriching", value)

        #     if(nType == "URL" and (subroutine == 'url' or subroutine == 'all')):
        #         ## deconstruct URL
        #         status = insert_domain(value, graph)
        #         # print(str(status))

        #     elif(nType == "Email" and (subroutine == 'email' or subroutine == 'all')):
        #         ## deconstruct Email
        #         status = insert_domain_and_user(value, graph)
        #         # print(str(status))

        #     elif(nType == "Host" and (subroutine == 'host' or subroutine == 'all')):
        #         ## resolve IP, MX, nameservers
        #         try:
        #             status1 = resolveHost(value, graph)
        #         except:
        #             print("IP resolve Error")
        #         try:
        #             status2 = getMailServer(value, graph)
        #         except:
        #             print("MX Error")
        #         try:
        #             w_results = whois(value)
        #             status3 = getNameservers(w_results, graph, value)
        #         except:
        #             print("Nameserver Error")
        #         try:
        #             w_results = whois(value)
        #             status3 = getRegistrar(w_results, graph, value)
        #         except:
        #             print("No registrar")

        #     elif(nType == "Domain" and (subroutine == 'domain' or subroutine == 'all')):
        #         ## resolve IP, MX, nameservers
        #         try:
        #             status1 = resolveHost(value, graph)
        #         except:
        #             print("IP resolve Error")
        #         try:
        #             status2 = getMailServer(value, graph)
        #         except:
        #             print("MX Error")
        #         try:
        #             w_results = whois(value)
        #             status3 = getNameservers(w_results, graph, value)
        #         except:
        #             print("Nameserver Error")
        #         try:
        #             w_results = whois(value)
        #             status3 = getRegistrar(w_results, graph, value)
        #         except:
        #             print("No registrar")

        #     elif(nType == "IP" and (subroutine == 'ip' or subroutine == 'all')):
        #         ## enrich all + ports + netblock
        #         enrichLocalNode('asn', value, nType, graph)
        #         enrichLocalNode('gip', value, nType, graph)
        #         enrichLocalNode('whois', value, nType, graph)
        #         enrichLocalNode('hostname', value, nType, graph)
        #         ## enrich cybexp needed here
        #         results = shodan_lookup(value)
        #         status1 = insert_ports(results, graph, value)

        #         status2 = insert_netblock(value, graph)

        #     print("Done with", str(value))
        ## End of non-threaded version

        ## This is used for tracking the performance speedup between seralized and threaded versions
        # end = time.time()
        # print(f"TIME: {end - start}")
        return Response({"Status": "All nodes were processed."})
        # return json.dumps(nodes)

    def threadedLoop(self, node, graph, subroutine):
        value = node["properties"]["data"]
        nType = node["properties"]["type"]
        print("--> Enriching", value)

        if(nType == "URL" and (subroutine == 'url' or subroutine == 'all')):
            ## deconstruct URL
            status = insert_domain(value, graph)
            # print(str(status))

        elif(nType == "Email" and (subroutine == 'email' or subroutine == 'all')):
            ## deconstruct Email
            status = insert_domain_and_user(value, graph)
            # print(str(status))

        elif(nType == "Host" and (subroutine == 'host' or subroutine == 'all')):
            ## resolve IP, MX, nameservers
            try:
                status1 = resolveHost(value, graph)
            except:
                print("IP resolve Error")
            try:
                status2 = getMailServer(value, graph)
            except:
                print("MX Error")
            try:
                w_results = whois(value)
                status3 = getNameservers(w_results, graph, value)
            except:
                print("Nameserver Error")
            try:
                w_results = whois(value)
                status3 = getRegistrar(w_results, graph, value)
            except:
                print("No registrar")

        elif(nType == "Domain" and (subroutine == 'domain' or subroutine == 'all')):
            ## resolve IP, MX, nameservers
            try:
                status1 = resolveHost(value, graph)
            except:
                print("IP resolve Error")
            try:
                status2 = getMailServer(value, graph)
            except:
                print("MX Error")
            try:
                w_results = whois(value)
                status3 = getNameservers(w_results, graph, value)
            except:
                print("Nameserver Error")
            try:
                w_results = whois(value)
                status3 = getRegistrar(w_results, graph, value)
            except:
                print("No registrar")

        elif(nType == "IP" and (subroutine == 'ip' or subroutine == 'all')):
            ## enrich all + ports + netblock
            enrichLocalNode('asn', value, nType, graph)
            enrichLocalNode('gip', value, nType, graph)
            enrichLocalNode('whois', value, nType, graph)
            enrichLocalNode('hostname', value, nType, graph)
            ## enrich cybexp needed here
            results = shodan_lookup(value)
            status1 = insert_ports(results, graph, value)

            status2 = insert_netblock(value, graph)

        print("Done with", str(value))

class wipe(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        wipeDB(graph)
        return Response({"Status": "Neo4j DB full wipe complete!"})

## Remove before release
from rest_framework.authentication import SessionAuthentication, BasicAuthentication 
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening

class importJson(APIView):
    permission_classes = (IsAuthenticated, )

    ## Also remove this line, it was to bypass the CSRF
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)

    # Description: Used to import a JSON file of the graph and loads the graph.
    # Parameters: <object>request - The user request
    # Returns: Response status
    # Author: Spencer Kase Rohlfing
    def post(self, request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        responce = Response(import_json(graph,request.data))
        return (responce)

class position(APIView):
    permission_classes = (IsAuthenticated, )

    ## Also remove this line, it was to bypass the CSRF
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)

    # Description: Used to update the current positions of each node and stores it in the Neo4j database.
    # Parameters: <object>request - The user request
    # Returns: Response status
    # Author: Spencer Kase Rohlfing
    def post(self, request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)

        status = update_positions(request.data, graph)
        return Response({"Status": "Success"})

class dataEntry(APIView):
    permission_classes = (IsAuthenticated, )

    ## TODO: Also remove this line, it was to bypass the CSRF
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)

    # Description: Used to send user event data to CYBEX
    # Parameters: <object>request - The user request
    # Returns: Response status
    # Author: Adam Cassell
    def post(self, request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)

        status = send_to_cybex(request.data, current_user)
        return Response({"Status": "Success"})

class getContents(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, path=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        result = get_contents(path)
        return Response(result)

# class insertURL(APIView):
#     permission_classes = (IsAuthenticated, )

#     def post(self, request, format=None):
#         current_user = request.user
#         graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
#                               current_user.graphdb.dbip, current_user.graphdb.dbport)
#         req = request.get_json()
#         Ntype = req['Ntype']
#         data = req['value']

#         status = insertNode(Ntype, data, graph)
#         if status == 1:
#             return Response({"Status": "Success"})
#         else:
#             return Response({"Status": "Failed"})


class start(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, format=None):
        res = request.get_json()
        os.environ['eventName'] = res['EventName']
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)

        print(res)
        for node in res['IOCS']:
            dataList = node['data'].split(',')
            dataList = list(map(str.strip, dataList))
            print('Type:', node['IOCType'])
            print('Data:', dataList)

            for data in dataList:
                status = insertLocalNode(node['IOCType'], data, graph)

        return Response('OK')

# TODO
# Needs more error checking and move variables to django.settings from env
class startFile(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, format=None):

        os.environ['eventName'] = request.form['eventName']

        # load csv/json file from request.files['fileNameHere]
        fileCSVDF = pd.read_csv(request.files['file'])

        # parse all node types and data
        # insert all nodes
        for i in range(len(fileCSVDF)):
            Ntype = str(fileCSVDF.iloc[i, 0])
            Nval = str(fileCSVDF.iloc[i, 1])
            Ntime = fileCSVDF.iloc[i, 2]

            status = insert(Ntype, Nval)

    # return status
        return Response(0)
