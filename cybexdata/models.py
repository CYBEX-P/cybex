from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
import requests
import json
import inspect

# User._meta.get_field('email').blank = False
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    orgid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name='Organization ID')
    organizationname = models.CharField(max_length=256, blank=True, verbose_name='Organization Name')
    tzname = models.CharField(max_length=50, blank=True, verbose_name='Timezone Name')
    cybex_token = models.CharField(max_length=50, blank=True, verbose_name='CYBEX Token')

# Receiver function for user creation/registration signals
@receiver(post_save, sender=User)
def create_user_extra(sender, instance, created, **kwargs):
    if created:
        
        # u = User.objects.get(username='test9')
        # org_id = u.profile.orgid
        # print("user added with org_id: " + str(org_id))
        #print(str(instance))
        #print(instance.client.email)
        url = "https://cybex-api.cse.unr.edu:5000/add/user"
        # The below grabs the passed email and password from the create_user event
        records =[]
        for frame_record in inspect.stack():
            records.append(frame_record[3])
            if frame_record[3]=='get_response':
                request = frame_record[0].f_locals['request']
                email = request.POST.get('email')
                password1 =  request.POST.get('password1')
                password2 = request.POST.get('password2')
        payload = {
            #"email": instance.client.email, # gets email of created user (required)
            "email": email, # gets email of created user (required)
            "password":password1,
            "password2":password2,
            "name": str(instance)
        }
        headers = {
            'content-type': "application/json",
            # we use Bearer token auth mode
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWJfdHlwZSI6ImN5YmV4cF91c2VyIiwiX2hhc2giOiJjMDU3ZWVkZTYxMTRiOWZjMTFkZWY3YTMzOGY2OTRkNjY5MWJkNjU2NjEzZjIxNzE4YzFiYmRmYWJkMzkxMDM2IiwianRpIjoiODY2YzNjMmMtMmQ3OC00Njg1LTgzNzUtYzQyMmMwODk1M2U2In0.pibz34CfF0B3QLsIKcP8qFzc7jZ57kvOOTHRq7RSS88"
            }
        payload = json.dumps(payload)
        r = requests.post(url, data=payload, headers=headers)
        res = json.loads(r.text)
        # print(res)
        # print(res["token"])
        Profile.objects.create(user=instance, cybex_token=res["token"])
        Graphdb.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_extra(sender, instance, **kwargs):
    instance.profile.save()
    instance.graphdb.save()

class Graphdb(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    dbport = models.CharField(max_length=256, blank=True, verbose_name='Database Port')
    dbip = models.CharField(max_length=256, blank=True, verbose_name='Database IP')
    dbuser = models.CharField(max_length=256, blank=True, verbose_name='Database User')
    dbpass = models.CharField(max_length=256, blank=True, verbose_name='Database Pass')
    containerid = models.CharField(max_length=256, blank=True, verbose_name='Container ID')

