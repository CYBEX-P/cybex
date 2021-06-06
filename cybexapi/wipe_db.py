"""Module containing functions for deleting user's neo4j graph data."""
import json
import os
from py2neo import Graph, Node, Relationship
from django.conf import settings

#TODO
#Move to Lib file
def wipeDB(graph):
    """Deletes all data from user's neo4j graph database."""
    graph.delete_all()
    print("Deleted entire graph")
    return 1
