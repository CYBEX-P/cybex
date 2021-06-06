"""Module containing functions for storing graph node positions."""

def update_positions(data, graph):
    """Used for writing position x & y to the Neo4j database.

    Args:
        data (dict): the JSON data.
        graph (py2neo.database.Graph): The graph object for the current graph.
    
    """
    if(data != None):
        for node in data:
            id_value = node['id']
            x_pos = node['x']
            y_pos = node['y']

            # print(node)

            graph.run(f"MATCH (a) \
                WHERE id(a) = {id_value} \
                SET a.x = {x_pos} \
                SET a.y = {y_pos}")