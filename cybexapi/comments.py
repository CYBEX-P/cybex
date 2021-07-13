"""Module containing functions for handling graph comments."""

from py2neo import Graph, Node, Relationship
import json
from django.conf import settings

def insertComment(comment,graph,value,nType):
    """Adds user comment to node data

    Args:
        comment (string): Comment to add to node.
        graph (py2neo.database.Graph): The graph object for the current graph.
        value (string): JSON data for the originating node.
        nType (string): The type of the originating node.

    Returns:
        1 if successful.

    """
    ip_node = graph.nodes.match(nType,data=value).first()
    if(ip_node):
            ip_node["comment"] = comment
            graph.push(ip_node)
            print("Comment added to node")
    else:
            print("Error adding Comment")
    return 1