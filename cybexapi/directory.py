#from py2neo import Graph, Node, Relationship
import json
import os
from django.conf import settings

# Description: Returns list of directory items at given path
# Parameters: <string>path - path of directory to observe inside static folder
# Returns: <dict>content_map - dictionary of root, subdirectories, and files
# Author: Adam Cassell
def get_contents(path):
    path = 'static/' + path.replace(":)","/")
    print(path)
    content_map = {
        "root": None,
        "directories": None,
        "files": None
    }
    try:
        content_map["root"], content_map["directories"], content_map["files"] = next(os.walk( os.path.join(path,'.')))
        return content_map
    except:
        print("error retrieving directory contents")
        return 1