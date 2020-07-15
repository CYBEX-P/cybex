import shodan
import yaml
from py2neo import Graph, Node, Relationship
from django.conf import settings

#TODO
#Move to django.settings. and document
def shodan_lookup(ip):
    
    API_KEY = settings.SHODAN_KEY

    api = shodan.Shodan(API_KEY)
    try:
        results = api.host(ip, minify=True)
    except:
        return None
    # results = api.scan(ip)

    # return list of ports detected
    return results['ports']

#TODO
#Move to lib file
def insert_ports(values, graph, ip):
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



# if __name__ == "__main__":

#     value = str(input("Enter an IP: "))
#     results = shodan_lookup(value)
#     print("Ports open: " + str(results['ports']))

