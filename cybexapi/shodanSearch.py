"""Module containing functions for inserting port info into the graph."""
import shodan
import yaml
from py2neo import Graph, Node, Relationship
from django.conf import settings

def shodan_lookup(ip):
    """Performs a shodan lookup to return detected ports for given IP."""
    
    API_KEY = settings.SHODAN_KEY

    api = shodan.Shodan(API_KEY)
    try:
        results = api.host(ip, minify=True)
    except:
        return None

    # return list of ports detected
    return results['ports']

def insert_ports(values, graph, ip):
    """Inserts ports into graph for given IP address.
    
    Args:
        values (string): comma separated string of ports.
        graph (py2neo.database.Graph): The graph object for the current graph.
        ip (string): The ip address to insert the detected ports for.

    Returns:
        1 if ports were able to be inserted successfully.
    
    """
    if values is None:
        return 0
        
    c = Node("Ports", data=values)
    try:
            ip_node = graph.nodes.match("IP", data=ip).first()
    except:
            ip_node = graph.nodes.match("Subnet", data=ip).first()

    c_node = graph.nodes.match("Ports", data = values).first()

    if(c_node):
            rel = Relationship(ip_node, "FROM", c_node)
            graph.create(rel)
            print("Existing port node linked")
    else:
            graph.create(c)
            rel = Relationship(ip_node, "FROM", c)
            graph.create(rel)
            print("New port node created and linked")

    return 1

