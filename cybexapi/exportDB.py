from py2neo import Graph, Node, Relationship
import os
import json
# TODO
# Needs documentation
def processExport(dataObject):
    for x in dataObject["Neo4j"][0]:
        for key in x['nodes']:
            # print(x['nodes'])
            # Before assigning color, referene malicious counts to assign threat level.
            threatLevel = -1  # default to -1 for inconclusive threat level
            sightings = -1  # default to -1 for unknown sightings
            if 'countMal' in str(key):
                if (key['properties']['count'] != 0):
                    # if (key['properties']['countMal'] != 0) and (key['properties']['count'] != 0):
                    # sightings = total count in cybex
                    sightings = key['properties']['count'] + \
                        key['properties']['countMal']
                    ratioMal = key['properties']['countMal']/sightings
                    if ratioMal == 0:
                        threatLevel = 0
                    elif 0 < ratioMal < 0.5:
                        threatLevel = 1
                    elif 0.5 <= ratioMal <= 1:
                        threatLevel = 2
                    # else:
                    #     threatLevel = 0
            #key['label'] = bucket(key['label'][0])
            if 'comment' in str(key):
                key['font'] = {'color': 'black', 'strokeWidth': 0,
                               'strokeColor': "white", 'background': threatColor(threatLevel)}
            key['label'] = key['label'][0]
            key['properties']['type'] = key['label']
            # Initialize color defaults and set special color classes
            key['color'] = 'rgba(151,194,252,1)'
            # if 'source' in key['properties']:
            #     if (key['properties']['source'] == 'cybex'):
            #         key['color']['border'] = 'rgba(255,255,255,1)'
            #         #key['color']['background'] = 'rgba(255,255,255,1)'
            key['value'] = sightings
            if key['label'] == 'IP':
                key['image'] = '/static/SVG/DataAnalytics/svg_ip.svg'
                key['color'] = threatColor(threatLevel)
                # else:
                #     #key['color'] = "#B37469"
                #     #key['color'] = 'rgba(151,252,158,1)'
                #     key['color'] = 'rgba(151,194,252,1)'
                #key['widthConstraint'] = 120
            elif key['label'] == 'Host':
                key['image'] = '/static/SVG/DataAnalytics/svg_host.svg'
                key['color'] = threatColor(threatLevel)
                # key['color'] = '#FB7E81'
                #key['color'] = 'rgba(247, 151, 77, 1)'
            elif key['label'] == 'URL':
                key['image'] = '/static/SVG/DataAnalytics/svg_ip.svg'
                key['color'] = threatColor(threatLevel)
                # else:
                #     #key['color'] = "#B37469"
                #     #key['color'] = 'rgba(151,252,158,1)'
                #     key['color'] = 'rgba(151,194,252,1)'
            elif key['label'] == 'SPort':
                key['color'] = '#8C99CE'
            elif key['label'] == 'DPort':
                key['color'] = '#5B8E7D'
            elif key['label'] == 'Email':
                key['image'] = '/static/SVG/DataAnalytics/svg_email.svg'
                key['color'] = threatColor(threatLevel)
                # key['color'] = '#34E5FF'
                # key['color'] = 'rgba(151,194,252,1)'
            elif key['label'] == 'Hash':
                key['color'] = '#FDF5BF'
            elif key['label'] == 'ASN':
                # key['color'] = '#8CB369'
                #key['color'] = 'rgba(168, 50, 50)'
                # key['color'] = 'rgba(151,194,252,1)'
                key['image'] = '/static/SVG/DataAnalytics/svg_asn.svg'
                key['color'] = threatColor(threatLevel)
            elif key['label'] == 'Country':
                # key['color'] = '#F4A259'
                #key['color'] = 'rgba(247, 151, 77, 1)'
                # key['color'] = 'rgba(151,194,252,1)'
                key['image'] = '/static/SVG/DataAnalytics/svg_country_alt.svg'
                key['color'] = threatColor(threatLevel)
            elif key['label'] == 'BTC':
                key['color'] = '#3185FC'
            elif key['label'] == 'MAC':
                key['color'] = '#DDF8E8'
            elif key['label'] == 'BGPath':
                key['color'] = '#28AFB0'
            elif key['label'] == 'SSID':
                key['color'] = '#E8E8E8'
            elif key['label'] == 'Domain':
                key['image'] = '/static/SVG/DataAnalytics/svg_ip.svg'
                key['color'] = threatColor(threatLevel)
                # if threatLevel == 0:
                #     key['color']['background']  = 'rgba(151,252,158,1)'
                #     key['color']['border']  = 'rgba(151,252,158,1)'
                # elif threatLevel == 1:
                #     key['color']['background'] = 'rgba(255,222,0,1)'
                #     key['color']['border'] = 'rgba(255,222,0,1)'
                # elif threatLevel == 2:
                #     key['color']['background'] = 'rgba(168,50,50,1)'
                #     key['color']['border'] = 'rgba(168,50,50,1)'
                # else:
                #     #key['color'] = "#B37469"
                #     #key['color'] = 'rgba(151,252,158,1)'
                #     key['color'] = 'rgba(151,194,252,1)'
            elif key['label'] == 'Ports':
                key['image'] = '/static/SVG/DataAnalytics/svg_ports.svg'
                key['color'] = threatColor(threatLevel)
                # key['color'] = "#ff41e2"
                # key['color'] = 'rgba(151,194,252,1)'
            elif key['label'] == 'Whois':
                # key['color'] = "#4070f4"
                key['color'] = threatColor(threatLevel)
            elif key['label'] == 'Subnet':
                key['image'] = '/static/SVG/DataAnalytics/svg_subnet.svg'
                # key['color'] = "#eeee58"
                # key['color'] = 'rgba(151,194,252,1)'
            elif key['label'] == 'Registrar':
                key['image'] = '/static/SVG/DataAnalytics/svg_registrar.svg'
                key['color'] = threatColor(threatLevel)
                # key['color'] = "#06de9e"
            elif key['label'] == 'Nameserver':
                key['color'] = "#cf4cf3"
            elif key['label'] == 'MailServer':
                key['image'] = '/static/SVG/DataAnalytics/svg_mail.svg'
                key['color'] = threatColor(threatLevel)
                # key['color'] = 'rgba(151,194,252,1)'
            elif key['label'] == 'User':
                key['color'] = "#d8e5f6"
            elif key['label'] == 'CybexCount':
                # key['color'] = "#29e682"
                key['color'] = 'rgba(151,194,252,1)'
            elif key['label'] == 'CybexRelated':
                # key['color'] = "#92fd6c"
                key['color'] = 'rgba(151,194,252,1)'
                key['shape'] = 'hexagon'
            else:
                key['color'] = threatColor(threatLevel)
            #     # key['color'] = 'rgba(151,194,252,1)'
            #     #key['shape'] = 'hexagon'
            #     key['color'] = 'rgba(255,255,255,1)'
            #     #key['color'] = 'rgba(151,252,158,1)',

            # Change label to represent the actual node data, rather than node type
            # Original logic relied on label property, so this is a stopgap measure.
            # Ideally, all prior logic should be rewritten to not use IOC type as label.
            # New property.type in nodedata now exists to contain this information.
            labelString = str(key['properties']['data'])
            key['label'] = (labelString[:11] +
                            '...') if len(labelString) > 14 else labelString

    for x in dataObject["Neo4j"][1]:
        for key in x['edges']:
            if key['type'] == 'CYBEX':
                key['dashes'] = 'true'
                #key['arrows'] = 'to;from'
                key['width'] = 0.5
                # key['label'] = "CYBEX-P"
                # key['font'] = {'size': 8, 'strokeWidth':0,'color':'white'}

    return dataObject

    # Added limit of 10 nodes and edges just for testing on full cybexp2 graph -- jeffs
    # "collect(blah blah blah)[..10] AS edges..."


def threatColor(threatLevel):
    color = 'rgba(151,194,252,1)'  # default color
    if threatLevel == 0:
        color = 'rgba(151,252,158,1)'
    elif threatLevel == 1:
        color = 'rgba(255,222,0,1)'
    elif threatLevel == 2:
        color = 'rgba(168,50,50,1)'
    return color


def bucket(label):
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
