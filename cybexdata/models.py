"""Module for defining Profile and Graph data models."""

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
    cybex_token = models.CharField(max_length=300, blank=True, verbose_name='CYBEX Token')

# Receiver function for user creation/registration signals
@receiver(post_save, sender=User)
def create_user_extra(sender, instance, created, **kwargs):
    """Adds the newly created user to the backend cybex user database."""
    if created:
        # This facilitates adding the newly created user to the backend cybex
        # user database. The following logic automates this process anytime a 
        # user is created through Django admin. Note the below details on how
        # this is ignored for manual superuser creation. Manual superuser
        # creation should only be done once per application deployment. This
        # is typically only for the first superuser account that is used
        # to configure and administer the application. All other accounts 
        # should thereafter be created using the application's Django admin
        # tools, to ensure the following automations occur for each new user.

        # Note that a superuser created manually will also need to be manually
        # assigned a token if it wishes to authenticate cybex queries 
        # (Profile.cybex_token). Therefore, it is advised to only use the
        # manually-created superuser account for administration purposes only.

        url = "https://cybex-api.cse.unr.edu:5000/create/user"

        # The following flag is set if a user creation event is triggered via
        # a get request (such as via the Django admin panel) instead of 
        # through the "python3 manage.py createsuperuser" terminal command.
        # User information is not correctly collected for manual superuser
        # creation, hence the need for this flag.

        created_via_admin_panel = False
        # The below grabs the passed email and password from the create_user event
        for frame_record in inspect.stack():
            #print(frame_record[3])
            if frame_record[3]=='get_response':
                request = frame_record[0].f_locals['request']
                email = request.POST.get('email')
                password1 =  request.POST.get('password1')
                password2 = request.POST.get('password2')
                created_via_admin_panel = True
        if created_via_admin_panel:
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
                'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWJfdHlwZSI6ImN5YmV4cF9zdXBlcnVzZXIiLCJfaGFzaCI6IjExN2NkNzVjODNkZmQzMjIzZDRlNWZjMDFjZjA4OTFkMmUzMjBlMWQxZjlmZTBjZmM4MmE1N2I0ZTRiNjg3ZWEiLCJqdGkiOiI4MTI1NTZkMS03MjBlLTRhYTYtYjY1Yi02ZjZkMzIxMTdlZDUifQ.D8OCZyIeYLOjSzS6lFlqK4iVu5kRtY7KkX0dkUQ-IuE"
                }
            payload = json.dumps(payload)
            r = requests.post(url, data=payload, headers=headers)
            res = json.loads(r.text)
            # print(res)
            # print(res["token"])
            Profile.objects.create(user=instance, cybex_token=res["token"])
        else:
            Profile.objects.create(user=instance)

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

