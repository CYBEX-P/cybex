"""Functions for preparing stored neo4j data for visual display.

This module facilitates the retreival and processing of stored neo4j graph
data. Processing augments the retrieved data with extra properties and
computed value assignments that prepare the data for interpretation by the 
front end.

"""

from py2neo import Graph, Node, Relationship
import os
import json

def processExport(dataObject):
    """Processes and augments stored data in preparation for frontend display.

    Each node is checked to see if count values has been added to its data. If
    so, a 'malicousness ratio' and categorical threat level (0- 2) are
    calculated from this data. This threat level is used to determine which
    color to assign to the node usign the threatColor() helper function.

    Node comments are handled, labels are simplified/truncated, and type
    values are assigned here as well. For especially common IOC types, 
    specific node icons are assigned.

    Args:
        dataObject (dict): Dictionary containing nodes and edges returned from
            export() function.

    Returns:
        dataObject (dict): The augmented version of the dataObject dict, with
            all properties and values required for frontend rendering.
    """
    for x in dataObject["Neo4j"][0]:
        for key in x['nodes']:
            # Before assigning color, referene malicious counts to assign threat level.
            threatLevel = -1  # default to -1 for inconclusive threat level
            sightings = -1  # default to -1 for unknown sightings
            # Set x and y to stored positions (if stored). Otherwise, ignore,
            # and the graph will be positioned randomly then stabilized.
            if 'x' in key['properties'] and 'y' in key['properties']:
                key['x'] = key['properties']['x']
                key['y'] = key['properties']['y']
            if 'countMal' in str(key):
                # sightings = total count in cybex
                sightings = (int(key['properties']['count']) + 
                    int(key['properties']['countMal']))
                if (sightings != 0):
                    ratioMal = int(key['properties']['countMal'])/sightings
                    if ratioMal == 0:
                        threatLevel = 0
                    elif 0 < ratioMal < 0.5:
                        threatLevel = 1
                    elif 0.5 <= ratioMal <= 1:
                        threatLevel = 2
            if 'comment' in str(key):
                key['font'] = {'color': 'black', 'strokeWidth': 0,
                               'strokeColor': "white", 'background': threatColor(threatLevel)}
            # Set label to only display a subset of its original value
            key['label'] = key['label'][0]
            # Make the type property the original label
            key['properties']['type'] = key['label']
            # Initialize color defaults and set special color classes
            key['color'] = 'rgba(151,194,252,1)'
            # 'value' is what drives the node sizing on the frontend. Change
            #  this to another value (ex: countMal) to change sizing rules
            key['value'] = sightings
            # Node color gets assigned according to threat level (if computed)
            key['color'] = threatColor(threatLevel)
            # For specific common IOC types, assign an associated node icon
            if key['label'] == 'IP':
                key['image'] = '/static/SVG/DataAnalytics/svg_ip.svg'
            elif key['label'] == 'Host':
                key['image'] = '/static/SVG/DataAnalytics/svg_host.svg'
            elif key['label'] == 'URL':
                key['image'] = '/static/SVG/DataAnalytics/svg_ip.svg'
            elif key['label'] == 'Email':
                key['image'] = '/static/SVG/DataAnalytics/svg_email.svg'
            elif key['label'] == 'ASN':
                key['image'] = '/static/SVG/DataAnalytics/svg_asn.svg'
            elif key['label'] == 'Country':
                key['image'] = '/static/SVG/DataAnalytics/svg_country_alt.svg'
            elif key['label'] == 'Domain':
                key['image'] = '/static/SVG/DataAnalytics/svg_ip.svg'
            elif key['label'] == 'Ports':
                key['image'] = '/static/SVG/DataAnalytics/svg_ports.svg'
            elif key['label'] == 'Subnet':
                key['image'] = '/static/SVG/DataAnalytics/svg_subnet.svg'
            elif key['label'] == 'Registrar':
                key['image'] = '/static/SVG/DataAnalytics/svg_registrar.svg'
            elif key['label'] == 'MailServer':
                key['image'] = '/static/SVG/DataAnalytics/svg_mail.svg'

            # Change label to represent the actual node data, rather than node type
            # Original logic relied on label property
            # New property.type in nodedata now exists to contain this information.
            labelString = str(key['properties']['data'])
            key['label'] = (labelString[:11] +
                            '...') if len(labelString) > 14 else labelString

    for x in dataObject["Neo4j"][1]:
        for key in x['edges']:
            if "CYBEX" in key['type']:
                key['dashes'] = 'true'
                key['width'] = 0.5

    return dataObject


def threatColor(threatLevel):
    """Returns an rgba color value based on given threat level."""
    color = 'rgba(151,194,252,1)'  # default color
    if threatLevel == 0:
        color = 'rgba(151,252,158,1)'
    elif threatLevel == 1:
        color = 'rgba(255,222,0,1)'
    elif threatLevel == 2:
        color = 'rgba(168,50,50,1)'
    return color


def bucket(label):
    """Reformats label for certain IOC types for better frontend presentation."""
    if label == 'ip' or label == 'ipv4':
        label = 'IP'
    elif label == 'asn':
        label = 'ASN'
    elif label == 'port':
        label = 'Ports'
    elif label == 'url' or label == 'uri' or label == 'url-t':
        label = 'URL'
    elif label == 'domain':
        label = 'Domain'
    elif label == 'hostname':
        label = 'Host'
    elif label == 'country_name':
        label = 'Country'
    return label


def export(graph):
    """Queries neo4j database to get the nodes and edges of the stored graph.

    Args:
        graph (py2neo.database.Graph): The graph object for the current graph

    Returns:
        dict: Dictionary representing nodes and edges retrieved from neo4j
            graph database.

    """
    r_response = graph.run("MATCH (a)-[r]->(b) \
        WITH collect( \
            { \
                from: id(a), \
                to: id(b), \
                type: type(r) \
            } \
        ) AS edges \
        RETURN edges").data()

    n_response = graph.run("MATCH (a) WITH collect( \
            { \
                    id: id(a), \
                    label: labels(a), \
                    properties: properties(a) \
            } \
        ) AS nodes RETURN nodes").data()

    return {"Neo4j": [n_response, r_response]}
