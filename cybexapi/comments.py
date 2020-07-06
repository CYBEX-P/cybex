from py2neo import Graph, Node, Relationship
from exportDB import bucket
import json

# Description: Adds user comment to node data
# Parameters: <string>comment - Comment to add to node
#             <object>graph - The current graph
#             <string>value - JSON data for the originating node
#             <string>Ntype - The type of the originating node
# Returns: 1 if successful
# Author: Adam Cassell
def insertComment(comment,graph,value,nType):
    ip_node = graph.nodes.match(nType,data=value).first()
    if(ip_node):
            ip_node["comment"] = comment
            graph.push(ip_node)
            print("Comment added to node")
    else:
            print("Error adding Comment")
    return 1