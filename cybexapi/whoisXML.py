import os
import json
from py2neo import Graph, Node, Relationship
import yaml

#TODO
#Need to convert this to use django.settings to retrieve key from env 
def whois(data):

    try:
        from urllib.request import urlopen
    except ImportError:
        from urllib2 import urlopen
        
    with open('../config.yaml','r') as f:
        conf = yaml.load(f)

    domainName = data
    apiKey = conf['whoisData']['apikey']

    url = 'https://www.whoisxmlapi.com/whoisserver/WhoisService?'\
        + 'domainName=' + domainName + '&apiKey=' + apiKey + "&outputFormat=JSON"

    response = urlopen(url).read().decode('utf8')
    jsonResponse = json.loads(response)
    
    return jsonResponse


def insertWhois(data, graph, value):
    # print(str(data))
    if(data != 0):
        try:
            c = Node("Whois", data = data["WhoisRecord"]["registryData"]["registrant"]["organization"])
            ip_node = graph.nodes.match( data=value).first()
            c_node = graph.nodes.match("Whois", data = data["WhoisRecord"]["registryData"]["registrant"]["organization"]).first()

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
                c = Node("Whois", data = data["WhoisRecord"]["registrant"])
                ip_node = graph.nodes.match( data=value).first()
                c_node = graph.nodes.match("Whois", data = data["WhoisRecord"]["registrant"]["organization"]).first()

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
