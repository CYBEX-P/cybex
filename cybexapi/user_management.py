
import json
import requests
import os
from django.conf import settings


def user_info(user,info_to_return):
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}
    if info_to_return == "info":  
        url = "https://cybex-api.cse.unr.edu:5000/user_info"
        r = requests.get(url, headers=headers)
        # return r.json
        return r.text
    else:
        raise ValueError("Invalid value for 'info_to_return'")

def org_info(user,org_hash,return_type):
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}
    payload = {'org_hash': org_hash, 'return_type': return_type}
    url = "https://cybex-api.cse.unr.edu:5000/org_info"
    r = requests.get(url, headers=headers, params=payload)
    # return r.json
    return r.text