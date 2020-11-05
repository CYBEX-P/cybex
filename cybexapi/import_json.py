import json
import os
from cybexapi.wipe_db import wipeDB
from django.conf import settings

def import_json(graph, data):
    wipeDB(graph) # clear graph before importing
    values = data['file'].read()
    values = json.loads(values)
    # print(values)
    writeToDB(graph,values)
    print("Imported entire graph")
    return values

def writeToDB(graph,json):
    nodes = json['Neo4j'][0][0]['nodes']
    # print(nodes)
    for index, node in enumerate(nodes):
        data = node['properties']['data']
        data_type = node['properties']['type']
        data_properties = node['properties']

        # Used double {{ }} b/c of how formatting works in Python
        id_response = graph.run(f"CREATE (n:{data_type} \
            {{ data: '{data}'}}) \
            RETURN ID(n)").data()
        # print(id_response)

        id_value = id_response[0]['ID(n)']
        nodes[index]['updated_id'] = id_value
        # print(nodes) # Has new element 'updated_id

        # Comparing if the length is greater than 2 means that there is more values besides 'data' & 'type'
        if(len(data_properties) > 2):
            for key, value in data_properties.items():
                # Don't do anything if the key is data or type
                if isinstance(value,str):
                    # Add quotes to string so Neo4j recognizes it as string. 
                    value = f"\"{value}\""

                if(key != 'data' and key != 'type'): 
                    graph.run(f"MATCH (a) \
                        WHERE id(a) = {id_value} \
                        SET a.{key} = {value}")

    edges = json['Neo4j'][1][0]['edges']
    for edge in edges:
        old_source = edge['from']
        relation_type = edge['type']
        old_destination = edge['to']

        for node in nodes:
            if(node['id'] == old_source):
                new_source = node['updated_id']
            elif(node['id'] == old_destination):
                new_destination = node['updated_id']
        # print(f"New Source: {new_source}")
        # print(f"New Destination: {new_destination}")
        graph.run(f"MATCH (a),(b) \
            WHERE id(a) = {new_source} AND id(b) = {new_destination} \
            CREATE (a)-[r:{relation_type}]->(b)")