"""Module for connecting to Neo4j DB in docker container."""

import docker
import time
import socket
from contextlib import closing
import json
import string
import random
from py2neo import Graph, Node, Relationship

def testGraphConnection(user, passw, addr, bolt_port):
    URI = "bolt://" + addr + ":" + str(bolt_port)
    
    graph = Graph(URI, auth=(user, passw))
    
    try:
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
        return True
    except:
        return False
    

def pw_gen(size = 8, chars=string.ascii_letters + string.digits):
        return ''.join(random.choice(chars) for _ in range(size))

def killall(client):
    for container in client.containers.list():
        container.kill()

def find_free_ports():
    #find first free port for bolt listener
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        bolt = s.getsockname()[1]
        #find second free port for http listener while bolt listener is still up
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as x:
            x.bind(('', 0))
            x.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            http = x.getsockname()[1]
    return bolt,http

def list_db(client):
    container_info = []
    for container in client.containers.list():
         container_info.append({"id" :container.id, "status": container.status, "name": container.name})
    return container_info

def delete_db(client, id):
    container = client.containers.get(id)
    container.kill()

def create_db(client, stats=None):

    if stats:
        (bolt,http) = (stats['bolt'],stats['http'])
        bindip = stats['bindip']
        newpass = stats['password']
    else:
        (bolt,http) = find_free_ports()
        bindip = '127.0.0.1'
        newpass = pw_gen(15)

    enviro = ['JAVA_OPTS=-Xmx1g','NEO4J_AUTH=neo4j/' + newpass]
    porto = {'7687/tcp':(bindip,bolt),'7474/tcp':(bindip,http)}
    #if we need persistence.  Which we don't right now
    volumeo = {'/logs': {'bind': '/logs', 'mode': 'rw'},'/data': {'bind': '/data','mode':'rw'}}
    containero = 'neo4j:3.0'

    c = client.containers.run(containero,environment=enviro,ports=porto,detach=True)
    
    while(True):
        time.sleep(2)
        c.reload()
        if(c.status == 'running'):
            break

    #check to see we can export from it. 
    ticks=0
    while(not testGraphConnection("neo4j",newpass,bindip,bolt)):
        time.sleep(2)
        ticks = ticks +1 
        if ticks > 5:
            print("Failed to create neo4j docker container")
            break


    containerstats = {"bolt": bolt, "http": http, "ip": bindip, "id": c.id, "password": newpass}

    return json.dumps(containerstats,indent=4,sort_keys=True)

def check_db(client,containerid):
    try:
        container = client.containers.get(containerid)
    except:
        return False
        
    if container and container.status == "running":
        return True
    else:
        return False

if __name__== "__main__":
    client = docker.from_env()
    #killall(client)
    stats = create_db(client)
    #newstats = {"bolt":12345, "http":12346, "bindip": '127.0.0.1', "id": 1, "password":"password"}
    #stats = create_db(client,newstats)
    print(stats)
    print(json.dumps(list_db(client),indent=4,sort_keys=True))

