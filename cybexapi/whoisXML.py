"""Module containing functions for adding whois information to the graph."""
import os
import json
from py2neo import Graph, Node, Relationship
import yaml
from django.conf import settings

# TODO
# Need to convert this to use django.settings to retrieve key from env

def whois(data):
    """Returns whois information for given domain as JSON."""
    try:
        from urllib.request import urlopen
    except ImportError:
        from urllib2 import urlopen

    domainName = data
    apiKey = settings.WHOIS_KEY

    url = 'https://www.whoisxmlapi.com/whoisserver/WhoisService?'\
        + 'domainName=' + domainName + '&apiKey=' + apiKey + "&outputFormat=JSON"

    response = urlopen(url).read().decode('utf8')
    jsonResponse = json.loads(response)

    return jsonResponse


def insertWhois(data, graph, value):
    """Inserts whois organization info into graph for given domain/host."""
    #print(str(data))
    if(data != 0):
        try:
            c = Node("Whois", data=data["WhoisRecord"]
                     ["registryData"]["registrant"]["organization"])
            ip_node = graph.nodes.match(data=value).first()
            c_node = graph.nodes.match(
                "Whois", data=data["WhoisRecord"]["registryData"]["registrant"]["organization"]).first()

            if(c_node):
                rel = Relationship(ip_node, "HAS_WHOIS", c_node)
                graph.create(rel)
                print("Existing whois node linked")
            else:
                graph.create(c)
                rel = Relationship(ip_node, "HAS_WHOIS", c)
                graph.create(rel)
                print("New whois node created and linked")
            return 1

        except:
            try:
                c = Node("Whois", data=data["WhoisRecord"]["registrant"])
                ip_node = graph.nodes.match(data=value).first()
                c_node = graph.nodes.match(
                    "Whois", data=data["WhoisRecord"]["registrant"]["organization"]).first()

                if(c_node):
                    rel = Relationship(ip_node, "HAS_WHOIS", c_node)
                    graph.create(rel)
                    print("Existing whois node linked")
                else:
                    graph.create(c)
                    rel = Relationship(ip_node, "HAS_WHOIS", c)
                    graph.create(rel)
                    print("New whois node created and linked")
                return 1

            except:
                print("No registrant on file")
                return 0

    else:
        print("No whois Entry")
        return 0
