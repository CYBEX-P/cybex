import json
import os

from django.conf import settings

def import_json(data):
    values = data['file'].read()
    values = json.loads(values)
    print(values)
    return values