"""Module containing functions for cybex user/org management."""
import json
import requests
import os
from django.conf import settings


def user_info(user,info_to_return):
    """Gets requested information about a CYBEX user.
    
    Args:
        user (models.User): The reqesting user.
        info_to_return (string): "user_of" for all orgs user belongs to,
                "admin_of" for all orgs user is admin of, or "basic_info" for 
                user info object containing user hash, username, email.
    
    Returns:
        JSON response from backend CYBEX API.
    
    """
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + user_token}
    if info_to_return == "basic_info":  
        url = "https://cybex-api.cse.unr.edu:5000/user/info/self"
    elif info_to_return == "admin_of":  
        url = "https://cybex-api.cse.unr.edu:5000/orgs/admin_of"
    elif info_to_return == "user_of":  
        url = "https://cybex-api.cse.unr.edu:5000/orgs/user_of"      
    else:
        raise ValueError("Invalid value for 'info_to_return'")
    r = requests.get(url, headers=headers)
    # return r.json
    return r.json()

def org_info(user,org_hash,return_type):
    """Gets requested information about a CYBEX organization.
    
    Args:
        user (models.User): The reqesting user.
        org_hash (string): unique hash for the org.
        return_type (string): "admin","user","acl", or "all". Specifies
            whether to return the chosen individual list or all lists
            for the given org.
    
    Returns:
        JSON response from backend CYBEX API.
    
    """
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWJfdHlwZSI6ImN5YmV4cF91c2VyIiwiX2hhc2giOiJkMjMwZjU0Y2IxYzc3MmMwNWFiZmE1MGYxN2U2NGYxNmI2YTg4NGM5MTRmMDEyMjIyM2ZlOWRkYzk4ZGMyOTQxIiwianRpIjoiMzc0N2Q4NzctOTY2MC00NzhjLWEzNDAtZjYzMmRmNWQwNjM4In0.GM3nFOCg_JRZqqABaqwcW_s-AK0YP_m5agg2fZRV_zo'}
    data = {'org_hash': org_hash, 'return_type': return_type}
    data = json.dumps(data)
    url = "https://cybex-api.cse.unr.edu:5000/org/info"
    r = requests.post(url, headers=headers, data=data)
    print(r)
    return r.json()

def org_add_remove(user,org_hash,users,list_type,action):
    """Adds or removes user(s) from a CYBEX organization list.
    
    Args:
        user (models.User): The reqesting user.
        org_hash (string): unique hash for the org
        users (list of str): list of user hashes to be added or removed.
        list_type (string): "admin","user", or "acl". The list to which the
            given users should be added or removed from.
        action (string): "add" or remove". The action to perform for the 
            given users.
    
    Returns:
        JSON response from backend CYBEX API.
    
    """
    user_token = user.profile.cybex_token
    headers = {'content-type': 'application/json',
               'Authorization': 'Bearer ' + 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWJfdHlwZSI6ImN5YmV4cF91c2VyIiwiX2hhc2giOiJkMjMwZjU0Y2IxYzc3MmMwNWFiZmE1MGYxN2U2NGYxNmI2YTg4NGM5MTRmMDEyMjIyM2ZlOWRkYzk4ZGMyOTQxIiwianRpIjoiMzc0N2Q4NzctOTY2MC00NzhjLWEzNDAtZjYzMmRmNWQwNjM4In0.GM3nFOCg_JRZqqABaqwcW_s-AK0YP_m5agg2fZRV_zo'}
    if action == "add":
        data = {'org_hash': org_hash, 'user': users, "add_to": list_type}
        url = "https://cybex-api.cse.unr.edu:5000/org/add/user"
    elif action == "remove":
        data = {'org_hash': org_hash, 'user': users, "del_from": list_type}
        url = "https://cybex-api.cse.unr.edu:5000/org/del/user"
    else:
        raise ValueError("Invalid value for 'action'")
    data = json.dumps(data)
    r = requests.post(url, headers=headers, data=data)
    return r.json()