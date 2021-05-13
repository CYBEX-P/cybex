# Import modules and 3rd party libs
from py2neo import Graph, Node, Relationship
import socket
import json
import os
from django.conf import settings

# Import local scripts
#from cybexapi.cybexlib import pull_ip_src
from cybexapi.gip import geoip, ASN
# TODO
# All this needs to be documented and moved to lib file

# deprecated, testing if still being used...
# def full_load(graph):

#     ip_nodes = pull_ip_src()

#     ## Insert IP Nodes ####################################################
#     tx = graph.begin()
#     for node in ip_nodes:
#         a = Node("IP", data=node)
#         tx.create(a)

#     tx.commit()
#     print("IP Nodes Created")
#     #######################################################################

#     ## Query and Insert hostname nodes w/ relationships ###################
#     for node in ip_nodes:

#         try:
#             host = socket.gethostbyaddr(node)
#             a = Node("Host", data=host[0])
#             ip_node = graph.nodes.match("IP", data=node).first()
#             h_node = graph.nodes.match("Host", data=host[0]).first()

#             if(h_node):
#                 rel = Relationship(ip_node, "IS_RELATED_TO", h_node)
#                 graph.create(rel)
#                 print("Existing hostname node linked")

#             else:
#                 graph.create(a)
#                 rel = Relationship(ip_node, "IS_RELATED_TO", a)
#                 graph.create(rel)
#                 print("New hostname node created and linked", host[0])

#         except:
#             pass

#     #######################################################################

#     ## Insert Geoip relationships and nodes ###############################
#     for ip in ip_nodes:

#         geo_info = geoip(ip)

#         if(geo_info != 0):
#             c = Node("Country", data=geo_info["country"])
#             ip_node = graph.nodes.match("IP", data=ip).first()
#             c_node = graph.nodes.match(
#                 "Country", data=geo_info["country"]).first()

#             if(c_node):
#                 rel = Relationship(ip_node, "IS_LOCATED_IN", c_node)
#                 graph.create(rel)
#                 print("Existing country node linked")
#             else:
#                 graph.create(c)
#                 rel = Relationship(ip_node, "IS_LOCATED_IN", c)
#                 graph.create(rel)
#                 print("New country node created and linked")
#         else:
#             print("No GeoIP Entry for {}".format(ip))

#     #######################################################################

#     ## Insert ASN relationships and nodes #################################
#     for ip in ip_nodes:

#         asn_info = ASN(ip)

#         if(asn_info != 0):
#             a = Node("ASN", data=asn_info["ASN"])
#             ip_node = graph.nodes.match("IP", data=ip).first()
#             a_node = graph.nodes.match("ASN", data=asn_info["ASN"]).first()

#             if(a_node):
#                 rel = Relationship(ip_node, "HAS_ASN", a_node)
#                 graph.create(rel)
#                 print("Existing asn node linked")
#             else:
#                 graph.create(a)
#                 rel = Relationship(ip_node, "HAS_ASN", a)
#                 graph.create(rel)
#                 print("New asn node created and linked")
#         else:
#             print("No asn Entry for {}".format(ip))

#     #######################################################################

#     return 1


def insertNode(nodeType, data, graph):

    if nodeType:
        tx = graph.begin()
        a = Node(nodeType, data=data)
        tx.create(a)
        tx.commit()
        return 1
    else:
        return 0


def insertHostname(node, graph):

    try:
        host = socket.gethostbyaddr(node)
        a = Node("Host", data=host[0])
        ip_node = graph.nodes.match("IP", data=node).first()
        h_node = graph.nodes.match("Host", data=host[0]).first()

        if(h_node):
            rel = Relationship(ip_node, "IS_RELATED_TO", h_node)
            graph.create(rel)
            print("Existing hostname node linked")

        else:
            graph.create(a)
            rel = Relationship(ip_node, "IS_RELATED_TO", a)
            graph.create(rel)
            print("New hostname node created and linked", host[0])

        return 1

    except:
        print("No hostname Entry for {}".format(node))
        return 0


if __name__ == '__main__':
    full_load()
