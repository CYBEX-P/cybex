import json
import os

def update_positions(data, graph):
    import ast 
    nodes = ast.literal_eval(data)
    for node in nodes:
        id_value = node['id']
        x_pos = node['x']
        y_pos = node['y']

        graph.run(f"MATCH (a) \
            WHERE id(a) = {id_value} \
            SET a.x = {x_pos} \
            SET a.y = {y_pos}")