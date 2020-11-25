import json
import os

def update_positions(data, graph):
    if(data != None):
        for node in data:
            id_value = node['id']
            x_pos = node['x']
            y_pos = node['y']

            print(node)

            graph.run(f"MATCH (a) \
                WHERE id(a) = {id_value} \
                SET a.x = {x_pos} \
                SET a.y = {y_pos}")