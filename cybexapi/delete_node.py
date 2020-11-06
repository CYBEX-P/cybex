import json
import os

def delete_node(node_type, data, graph):
    # print(node_type)
    # print(data)
    
    # The line below will do the same thing as the match function in graph.evaulate
    # ip_node = graph.nodes.match(node_type, data=node).first()

    node = f"\"{data}\""

    # Need to add a check to see if the test doesn't return true
    del_node = graph.evaluate(f"MATCH (n:{node_type}) where n.data = {node} RETURN n")
    # print(test.identity)

    graph.delete(del_node)
    print("Deleted node")
    return 1