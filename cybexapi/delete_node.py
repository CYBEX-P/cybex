"""Module containing functions for deleting graph nodes."""

def delete_node(node_id, graph):
    """Used to search the Neo4j db for a node and delete it from the db.
    
    Args:
        request (rest_framework.request.Request): The request object.

    Returns:
        True
    
    """

    # Need to add a check to see if the test doesn't return true
    del_node = graph.evaluate(f"MATCH (n) \
                WHERE id(n) = {node_id} \
                RETURN n")

    graph.delete(del_node)
    print("Deleted node")
    return 1