"""Module containing functions for inserting various nodes to the graph."""
# Import modules and 3rd party libs
from py2neo import Graph, Node, Relationship
import socket
import json
import os
from django.conf import settings
from cybexapi.gip import geoip, ASN

def insertNode(nodeType, data, graph):
    """Inserts given node into the graph.

    Args:
        nodeType (string): The type of the node to insert.
        data (string): The value of the node.
        graph (py2neo.database.Graph): The graph object for the current graph.

    Returns:
        1 if node is able to be inserted.

    """
    if nodeType:
        tx = graph.begin()
        a = Node(nodeType, data=data)
        tx.create(a)
        tx.commit()
        return 1
    else:
        return 0


def insertHostname(node, graph):
    """Inserts host node into the graph for given IP node.
    
    Args:
        node (string): The value of the IP node.
        graph (py2neo.database.Graph): The graph object for the current graph.

    Returns:
        1 if host node is able to be inserted.

    """

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
