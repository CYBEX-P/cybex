import json
import os

from django.conf import settings

import pprint

def import_json(graph, data):
    values = data['file'].read()
    values = json.loads(values)
    # print(values)
    pp = pprint.PrettyPrinter(indent=4)
    pp.pprint(values['Neo4j'][0][0]['nodes'])
    writeToDB(graph,values)
    return values

def writeToDB(graph,json):
    nodes = json['Neo4j'][0][0]['nodes']
    # print(nodes)
    pp = pprint.PrettyPrinter(indent=4)
    for index, node in enumerate(nodes):
        data = node['properties']['data']
        data_type = node['properties']['type']

        # Used double {{ }} b/c of how formatting works in Python
        id_response = graph.run(f"CREATE (n:{data_type} \
            {{ data: '{data}'}}) \
            RETURN ID(n)").data()
        # print(id_response)
        pp.pprint(id_response)
        nodes[index]['new_info']['updated_id'] = id_response[0]['ID(n)']
    # print(nodes) # Has new element 'updated_id'
    pp.pprint(nodes)

