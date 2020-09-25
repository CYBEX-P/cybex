import json
import os
import requests

from django.conf import settings

def import_json():
    print(request.get_data())
    data = request.files['file']
    if data:
        data.save(data.filename)
        # return 'uploaded'
        with open(data.filename) as f:
            f1 = json.load(f)
            #print(json.dumps(f1, indent=4))
            return jsonify(f1)
