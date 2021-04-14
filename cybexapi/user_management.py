
import json
import requests
import os
from django.conf import settings


def user_info(user,info_to_return):
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}
    if info_to_return == "complete_info":  
        url = "https://cybex-api.cse.unr.edu:5000/user/info/self"
    elif info_to_return == "admin_of":  
        url = "https://cybex-api.cse.unr.edu:5000/orgs/admin_of"
    elif info_to_return == "user_of":  
        url = "https://cybex-api.cse.unr.edu:5000/orgs/user_of"      
    else:
        raise ValueError("Invalid value for 'info_to_return'")
    r = requests.get(url, headers=headers)
    # return r.json
    return r.text

def org_info(user,org_hash,return_type):
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}
    data = {'org_hash': org_hash, 'return_type': return_type}
    url = "https://cybex-api.cse.unr.edu:5000/org_info"
    r = requests.post(url, headers=headers, data=data)
    return r.text

def org_add_remove(user,org_hash,users,list_type,action):
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}
    if action == "add":
        data = {'org_hash': org_hash, 'user': users, "add_to": list_type}
        url = "https://cybex-api.cse.unr.edu:5000/org/add/user"
    elif action == "remove":
        data = {'org_hash': org_hash, 'user': users, "remove_from": list_type}
        url = "https://cybex-api.cse.unr.edu:5000/org/remove/user"
    else:
        raise ValueError("Invalid value for 'action'")
    r = requests.post(url, headers=headers, data=data)
    return r.text