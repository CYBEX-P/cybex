import json
import os

def delete_node(node_type, data, graph):
    print(node_type)
    print(data)
    if(node_type == 'gip'):
        # ip_node = graph.nodes.match("IP", data=node).first()

        node = f"\"{data}\""
        # Need to add a check to see if the test doesn't return true
        del_node = graph.evaluate(f"MATCH (n:IP) where n.data = {node} RETURN n")
        # print(test.identity)
        graph.delete(del_node)
        print("Deleted node")
    return 1