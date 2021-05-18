"""Main API implementation file for CYBEX-P Web Application.

This file contains all API implementations, using Django rest framework. All
backend functionality required by the frontend client is accessed through
the APIViews defined in this file.

This file also contains a number of helper functions that assist the requests
defined in each APIview.

Note that following Django rest framework structure, URL endpoints that are
bound to these APIviews can be found in urls.py.

"""

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
from cybexapi.cybexlib import cybexCountHandler, cybexRelatedHandler, send_to_cybex #,pull_ip_src,
from cybexapi.shodanSearch import shodan_lookup, insert_ports
from cybexapi.import_json import import_json
from cybexapi.delete_node import delete_node
from cybexapi.positions import update_positions
from cybexapi.directory import get_contents
from cybexapi.user_management import user_info, org_info, org_add_remove
import json
from cybexapi.wipe_db import wipeDB
import pandas as pd
import time
import threading


# This needs more error checking and probably a more elegant check to see if the db is available
def connect2graph(user, passw, addr, bolt_port):
    """returns the graph db stored in the given user's docker container."""
    URI = "bolt://" + addr + ":" + str(bolt_port)

    graph = Graph(URI, auth=(user, passw))
    return graph

# May want to cinsider moving to separate library file
def enrichLocalNode(enrich_type, value, node_type, graph, user=None,event=None):
    """Executes the requested enrichment type on the given node.
    
    Args:
        enrich_type (string): Type of enrichment to perfom.
        value (string): The value of the node to enrich.
        node_type (string): The node type of the node to enrich.
        graph (py2neo.database.Graph): The graph object for the current graph.
        user (django.contrib.auth.models.User): The current user making the 
            request. Defaults to None, because the only enrichments that
            require user authentication are cybex enrichments.
        event (threading.Event): Thread event object for faciliting the use
            of event.wait() between request attempts. Defaults to None, 
            because this is only needed for the cybexCount enrichment.
    
    Returns:
        dict: Dictionary containing insert status. Insert status is defined
            by whichever downstream function is called to complete the
            enrichment. For example, asn_insert returns an integer 1 or 0
            depending on success of the operation.

    """
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
            status = cybexCountHandler(node_type,value, graph, user, event)
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
        return "Invalid enrichment type."

# May consider moving to separate library file
def insertLocalNode(node_type, value, graph):
    """Inserts a node of given type and value to the graph"""
    status = insertNode(node_type, value, graph)
    return status

class exportNeoDB(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        """Retrieves and processes latest graph data from neo4j database.
        
        Args:
            request (rest_framework.request.Request): The request object
            info_to_return (string): "user_of" for all orgs user belongs to,
                "admin_of" for all orgs user is admin of, or "basic_info" for user
                info object containing user hash, username, email

        Returns:
            rest_framework.response.Response: API response containing 
                processed graph object.

        """
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
        """Inserts given node into the current graph
        
        Args:
            request (rest_framework.request.Request): The request object
            node_type (string): The type of IOC to insert.
            value (string): The value of the IOC to insert.

        Returns:
            rest_framework.response.Response: API response object, 
                with status either equal to "Success" or "Failed".

        """
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

    def get(self, request, node_id=None):
        """Deletes the given node from the current graph
        
        Args:
            request (rest_framework.request.Request): The request object
            node_id (int): The node id to remove from the graph.

        Returns:
            rest_framework.response.Response: API response object, 
                with status either equal to "Success" or "Failed".

        """
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

    def get(self, request, enrich_type=None, value=None, node_type=None):
        """Enrich the given node with the given enrichment type (GET version).

        The GET request for enriching nodes is intended for enrichments that
        don't need to pass sensitive user data (such as user object). This is
        mainly for standard network structure lookups like asn, gip, whois, 
        etc.. For CYBEX enrichments (cybexRelated, cybexCount), use the POST
        version (enrichNodePost()).
        
        Args:
            request (rest_framework.request.Request): The request object
            enrich_type (string): The type of enrichment to perform.
            value (string): The value of the node to be enriched.
            node_type (string): The type of the node to be enriched

        Returns:
            rest_framework.response.Response: API response object. 
                Insert status is defined by whichever downstream function 
                is called to complete the enrichment. Ex: 'asn' enrichment 
                type returns an integer 1 or 0 depending on success of the
                operation.

        """
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        result = enrichLocalNode(enrich_type, value, node_type, graph)
        return Response(result)

class enrichNodePost(APIView):
    permission_classes = (IsAuthenticated, )
    
    def post(self, request, enrich_type=None):
        """Enrich the given node with the given enrichent type (POST version).

        The POST request for enriching nodes is intended for enrichments that
        need to pass sensitive user data (such as user object). This is mainly
        for CYBEX enrichments (cybexRelated, cybexCount) that must
        authenticate with the CYBEX backend. For standard network structure 
        lookups like asn, gip, whois, etc., use GET version (enrichNode()).
        
        Args: 
            request (rest_framework.request.Request): The request object
            enrich_type (string): The type of enrichment to perform.

        Returns:
            rest_framework.response.Response: API response
                object. Insert status is defined by whichever downstream
                function is called to complete the enrichment. cybexRelated 
                and cybexCount enrichments return an integer 1 if successful, 
                0 if a read timeout occurs, and -1 if a connection timeout 
                occurs.
        
        """
        current_user = request.user
        data = request.data
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        result = enrichLocalNode(enrich_type, data["value"], data["Ntype"], graph, current_user)
        return Response(result)

class enrichURL(APIView):
    permission_classes = (IsAuthenticated, )
    
    def post(self, request):
        """Enrich the given URL (exposes its domain for further action).

        Note: This ideally should be consolidated into the enrichNodePost
        function, so that all enrichments are executed through common
        endpoints/functions.

        Args:
            request (rest_framework.request.Request): The request object

        Returns:
            rest_framework.response.Response: API response object. 1 if 
                successful.
        
        """
        current_user = request.user
        data = request.data
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        status = insert_domain(data["value"], graph)
        return Response(status)


class macroCybex(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, query):
        """Runs the CYBEX-P Analysis Macro.
        
        For every node in the graph, query CYBEX-P for the specified 
        information. The "related" query returns objects and attributes
        that were found in the same event contexts as each existing graph 
        node. The "count" query returns the number of tiems each node was seen
        in malicious vs. non-malicious event contexts. "both" runs "related"
        and "count" together in sequence. Multithreading has been implemented
        to increase pooling rate for both query types, processing all graph
        nodes in parallel.

        Args:
            request (rest_framework.request.Request): The request object
            query (string): The type of CYBEX-P query to perform. "related",
                "count", or "both".
        Returns:
            rest_framework.response.Response: API response object containing 
                the nodes that were processed as part of the macro run
        
        """
        # start = time.time() ## This is used for tracking performance

        current_user = request.user
        print(f"current user: {current_user}")
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)

        data = processExport(export(graph))
        nodes = data["Neo4j"][0][0]["nodes"]

        if query == "related" or query == "both":
            ## Start of threaded version part 1
            thread_list = []
            for node in nodes:
                thread = threading.Thread(target=self.threadedLoop_cybexRelated, args=(node,graph,current_user))
                thread_list.append(thread)
            for thread in thread_list:
                thread.start()
                # thread.start()
                # time.sleep(2)
            for thread in thread_list:
                thread.join()
            ## End of threaded version

        # Now that new related IOCs have been added, query cybexCount
        # This is done on all nodes including the newly added ones
        # Re-process graph because new nodes have been added from part 1
        data = processExport(export(graph))
        nodes = data["Neo4j"][0][0]["nodes"]
        
        if query == "count" or query == "both":
            # Event object is passed in to all threads in order to enable
            # thread-specific, non-blocking wait() functionality. This is
            # used within cybexCountHandler to limit repeated request
            # load on server
            event = threading.Event()
            ## Start of threaded version part 2
            thread_list = []
            for node in nodes:
                thread = threading.Thread(target=self.threadedLoop_cybexCount, args=(node,graph,current_user,event))
                thread_list.append(thread)
            for thread in thread_list:
                thread.start()
            for thread in thread_list:
                thread.join()
            ## End of threaded version

        ## This is used for tracking performance
        # end = time.time()
        # print(f"TIME: {end - start}")
        return Response(nodes)

    def threadedLoop_cybexRelated(self, node, graph, current_user):
        value = node["properties"]["data"]
        nType = node["properties"]["type"]
        if nType == "URL" or nType == "Host" or nType == "Domain" or nType == "IP" or nType == "ASN" or nType == "filename" or nType== "sha256" or nType== "Email" or nType== "email_addr" or nType== "subject" or nType== "body":
            print("--> Querying cybexRelated IOCs for", value)
            enrichLocalNode('cybexRelated', value, nType, graph, current_user)
            print("Done with", str(value))

    def threadedLoop_cybexCount(self, node, graph, current_user,event):
        value = node["properties"]["data"]
        nType = node["properties"]["type"]
        if nType == "URL" or nType == "Host" or nType == "Domain" or nType == "IP" or nType == "ASN" or nType == "filename" or nType== "sha256" or nType== "Email" or nType== "email_addr" or nType== "subject" or nType== "body":
            print("--> Querying cybexCounts for ", value)
            enrichLocalNode('cybexCount', value, nType, graph, current_user,event)
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
        try:
            status = send_to_cybex(request.data, current_user)
        except TypeError as e:
            return Response({"error": str(e)},status=400)
        return Response({"Status": "Success"})

class getContents(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, path=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        result = get_contents(path)
        return Response(result)

class currentUserInfo(APIView):
    '''API for returning various information about the requesting user.'''
    permission_classes = (IsAuthenticated, )

    def get(self, request, info_to_return=None):
        '''Returns various information about the requesting user.

        Args:
            request (rest_framework.request.Request): The request object
            info_to_return (string): "user_of" for all orgs user belongs to,
                "admin_of" for all orgs user is admin of, or "basic_info" for user
                info object containing user hash, username, email

        Returns:
            Response (rest_framework.response.Response): API response

        '''
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        result = user_info(current_user, info_to_return)
        return Response(result)

class orgInfo(APIView):
    '''API for returning various information about the given organization'''
    permission_classes = (IsAuthenticated, )

    ## TODO: Also remove this line, it was to bypass the CSRF
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)

    def post(self, request):
        '''Returns various information about the given organization.

        Args:
            request (rest_framework.request.Request): The request object

        Returns:
            Response (rest_framework.response.Response): API response

        '''
        current_user = request.user
        data = request.data
        # Request data is json with the following keys:
        #   org_hash (string): unique hash for the org
        #   return_type (string): "admin","user","acl", or "all". Specifies
        #      whether to return the chosen individual list or all lists
        #      for the given org
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        result = org_info(current_user, data["org_hash"], data["return_type"])
        return Response(result)

class orgAddRemoveUser(APIView):
    '''API for adding or removing user from given organization'''
    permission_classes = (IsAuthenticated, )

    ## TODO: Also remove this line, it was to bypass the CSRF
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)

    def post(self, request, org_hash=None, users=None, list_type=None, action=None):
        '''Add or remove user from given organization.

        Args:
            request (rest_framework.request.Request): The request object

        Returns:
            Response (rest_framework.response.Response): API response

        '''
        current_user = request.user
        data = request.data
        # Request data is json with the follwing keys:
            # org_hash (string): unique hash for the org
            # users (list of str): list of user hashes to be added or removed
            # list_type (string): "admin","user", or "acl". The list to which the
            #     given users should be added or removed from.
            # action (string): "add" or remove". The action to perform for the 
            #     given users.
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass,
                              current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        result = org_add_remove(current_user, data["org_hash"], data["users"], data["list_type"], data["action"])
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
