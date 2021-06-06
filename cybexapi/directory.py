"""Module containing functions for facilitating file downloads from server."""
import json
import os
from django.conf import settings

def get_contents(path):
    """Returns list of directory items at given path.

    Args:
        path (string): Path of directory to observe inside static folder.
    
    Returns: 
        content_map (dict): Dictionary of root, subdirectories, and files.

    """
    path = 'cybexweb/static/' + path.replace(":)","/")
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