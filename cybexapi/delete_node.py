

# Description: Used to actually search the Neo4j database for a node and delete the node
#               from the database.
# Parameters: <object>request - The user request
# Returns: True
# Author: Spencer Kase Rohlfing
def delete_node(node_id, graph):
    # print(node_id)

    # Need to add a check to see if the test doesn't return true
    del_node = graph.evaluate(f"MATCH (n) \
                WHERE id(n) = {node_id} \
                RETURN n")

    graph.delete(del_node)
    print("Deleted node")
    return 1