"""Module containing functions for gip enrichments (country and asn)"""
import geoip2.database
from py2neo import Graph, Node, Relationship
import json
import os
# from cybexapi.cybexlib import pull_ip_src
from django.conf import settings

# TODO
# Needs documentation and can be moved to lib file


def geoip(ip):
    """Retreives geoip information for given IP address."""
    path = str(os.path.dirname(__file__)) + '/data/GeoLite2-City.mmdb'
    reader = geoip2.database.Reader(path)

    insights = {}
    try:
        response = reader.city(ip)
        reader.close()

        insights["ip_src"] = ip
        insights["country"] = response.country.name
        insights["state_subdivision"] = response.subdivisions.most_specific.name
        insights["city"] = response.city.name

        return insights
    except:
        reader.close()
        return 0


def geoip_insert(data, graph):
    """Inserts country node into graph for given IP."""
    if(data != 0):
        c = Node("Country", data=data["country"])
        ip_node = graph.nodes.match("IP", data=data["ip_src"]).first()
        c_node = graph.nodes.match("Country", data=data["country"]).first()

        if(c_node):
            rel = Relationship(ip_node, "IS_LOCATED_IN", c_node)
            graph.create(rel)
            print("Existing country node linked")
        else:
            graph.create(c)
            rel = Relationship(ip_node, "IS_LOCATED_IN", c)
            graph.create(rel)
            print("New country node created and linked")
        return 1
    else:
        print("No GeoIP Entry")
        return 0


# TODO
# Move file location to django settings
def ASN(ip):
    """Retrieves ASN information for given IP address."""
    path = str(os.path.dirname(__file__)) + '/data/GeoLite2-ASN.mmdb'
    with geoip2.database.Reader(path) as reader:

        insights = {}
        try:
            response = reader.asn(ip)
            insights["ASN"] = response.autonomous_system_number
            insights["ASO"] = response.autonomous_system_organization
            insights["ip_src"] = ip
            return insights
        except:
            return 0


def asn_insert(data, graph):
    """Inserts ASN node into graph for given IP address."""
    if(data != 0):
        a = Node("ASN", data=str(data["ASN"]))
        ip_node = graph.nodes.match("IP", data=data["ip_src"]).first()
        a_node = graph.nodes.match("ASN", data=str(data["ASN"])).first()

        if(a_node):
            rel = Relationship(ip_node, "HAS_ASN", a_node)
            graph.create(rel)
            print("Existing asn node linked")
        else:
            graph.create(a)
            rel = Relationship(ip_node, "HAS_ASN", a)
            graph.create(rel)
            print("New asn node created and linked")
        return 1
    else:
        print("No asn Entry")
        return 0
