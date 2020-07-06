from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    orgid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name='Organization ID')
    organizationname = models.CharField(max_length=256, blank=True, verbose_name='Organization Name')
    tzname = models.CharField(max_length=50, blank=True, verbose_name='Timezone Name')

@receiver(post_save, sender=User)
def create_user_extra(sender, instance, created, **kwargs):
    if created:
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

