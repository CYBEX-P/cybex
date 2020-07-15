from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse
from rest_framework import status
import pytz
from datetime import datetime
from django.conf import settings
from py2neo import Graph
import json
from cybexapi.exportDB import processExport, export
from cybexapi.runner import insertNode, insertHostname
from cybexapi.gip import asn_insert, ASN, geoip, geoip_insert
from cybexapi.whoisXML import whois, insertWhois
from cybexapi.enrichments import insert_domain_and_user, insert_netblock, insert_domain, resolveHost, getNameservers,getRegistrar,getMailServer
from cybexapi.cybexlib import cybexCountHandler,  pull_ip_src
from cybexapi.shodanSearch import shodan_lookup, insert_ports
import json
from cybexapi.wipe_db import wipeDB
import pandas as pd
import time

#TODO
#This needs more error checking and probably a more elegent check to see if the db is available
def connect2graph(user, passw, addr, bolt_port):
    URI = "bolt://" + addr + ":" + str(bolt_port)
    
    graph = Graph(URI, auth=(user, passw))
    
    return graph

#TODO
#Move to library file
def enrichLocalNode(enrich_type, value, node_type, graph):

    if(enrich_type == "asn"):
            a_results = ASN(value)
            status = asn_insert(a_results, graph)
            return json.dumps({"insert status" : status})

    elif enrich_type == "gip":
            g_results = geoip(value)
            status = geoip_insert(g_results, graph)
            return json.dumps({"insert status" : status})

    elif enrich_type == "hostname":
            status = insertHostname(value, graph)
            return json.dumps({"insert status" : status})
    
    elif enrich_type == "whois":
            w_results = whois(value)
            status = insertWhois(w_results, graph, value)
            return json.dumps({"insert status" : status})

    elif enrich_type == "deconstructEmail":
            status = insert_domain_and_user(value, graph)
            return json.dumps({"insert status" : status})

    elif enrich_type == "netblock":
            status = insert_netblock(value, graph)
            return json.dumps({"insert status" : status})
    
    elif enrich_type == "ports":
            results = shodan_lookup(value)
            status = insert_ports(results, graph, value)
            return json.dumps({"insert status" : status})

    elif enrich_type == "resolveHost":
            status = resolveHost(value, graph)
            return json.dumps({"insert status" : status})
    
    elif enrich_type == "nameservers":
            w_results = whois(value)
            status = getNameservers(w_results, graph, value)
            return json.dumps({"insert status" : status})
        
    elif enrich_type == "registrar":
            w_results = whois(value)
            status = getRegistrar(w_results, graph, value)
            return json.dumps({"insert status" : status})

    elif enrich_type == "mailservers":
            status = getMailServer(value, graph)
            return json.dumps({"insert status" : status})

    elif enrich_type == "cybexCount":
            #status = insertCybexCount(value, graph)
            status = cybexCountHandler(node_type,value)
            return json.dumps({"insert status" : status})
    # elif enrich_type == "comment":
    #         # req = request.get_json()
    #         # Ntype = str(req['Ntype'])
    #         # value = str(req['value'])
    #         status = insertComment("test comment", graph, value, "Domain")
    #         return json.dumps({"insert status" : status})
    else:
        return "Invalid enrichment type. Try 'asn', 'gip', 'whois', or 'hostname'."

#TODO
#Move to library file
def insertLocalNode(Ntype, data, graph):
    status = insertNode(Ntype, data, graph)
    return status




class exportNeoDB(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)
        g = export(graph)
        #print(g)
        p = processExport(g)
        #print(p)
        return Response(p)

class insert(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None, x=None, y=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)
        status = insertLocalNode(x, y, graph)
        if status == 1:
            return Response({"Status" : "Success"})
        else:
            return Response({"Status" : "Failed"})

class enrichNode(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format= None, x=None, y=None, z=None):
        current_user = request.user
        value = ""
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)
        result = enrichLocalNode(x, y, z, graph)
        return Response(result)
    
class macroCybex(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        data = processExport(export(graph))
        nodes = data["Neo4j"][0][0]["nodes"]

        for node in nodes:
            value = node["properties"]["data"]
            nType = node["properties"]["type"]
            if nType == "URL" or nType == "Host" or nType == "Domain" or nType == "IP" or nType == "ASN" or nType == "filename": 
                print("--> Enriching", value)
                enrichLocalNode('cybexCount',value, nType, graph)
                print("Done with", str(value))

        return Response(nodes)

#TODO
#Move the bulk of code here to library file
class macro(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, format=None, data=None, ntype=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)
        
        nodes = data["Neo4j"][0][0]["nodes"]

        for node in nodes:
            value = node["properties"]["data"]
            nType = node["properties"]["type"]
            print("--> Enriching", value)

            if nType == "URL": 
                # deconstruct URL
                status = insert_domain(value, graph)
                print(str(status))

            elif nType == "Email":
                # deconstruct Email
                status = insert_domain_and_user(value, graph)
                print(str(status))

            elif nType == "Host":
                # resolve IP, MX, nameservers
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
            
            elif nType == "Domain":
                # resolve IP, MX, nameservers
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

            elif nType == "IP":
                # enrich all + ports + netblock 
                enrichLocalNode('asn', value, nType, graph)
                enrichLocalNode('gip', value, nType, graph)
                enrichLocalNode('whois', value, nType, graph)
                enrichLocalNode('hostname', value, nType, graph)
                # enrich cybexp needed here
                results = shodan_lookup(value)
                status1 = insert_ports(results, graph, value)

                status2 = insert_netblock(value, graph)
            
            print("Done with", str(value))

        return json.dumps(nodes)

class wipe(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self,request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)
        wipeDB(graph)
        return Response({"Status":"Neo4j DB full wipe complete!"})
        

class insertURL(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self,request, format=None):
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)
        req = request.get_json()
        Ntype = req['Ntype']
        data = req['value']

        status = insertNode(Ntype, data, graph)
        if status == 1:
            return Response({"Status" : "Success"})
        else:
            return Response({"Status" : "Failed"})


class start(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self,request, format=None):
        res = request.get_json()
        os.environ['eventName'] = res['EventName']
        current_user = request.user
        graph = connect2graph(current_user.graphdb.dbuser, current_user.graphdb.dbpass, current_user.graphdb.dbip, current_user.graphdb.dbport)

        print(res)
        for node in res['IOCS']:
            dataList = node['data'].split(',')
            dataList = list(map(str.strip, dataList))
            print('Type:', node['IOCType'])
            print('Data:', dataList)

            for data in dataList:
                status = insertLocalNode(node['IOCType'], data, graph)

        return Response('OK')

#TODO
#Needs more error checking and move variables to django.settings from env
class startFile(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self,request, format=None):
    
        os.environ['eventName'] = request.form['eventName']

        #load csv/json file from request.files['fileNameHere]
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



