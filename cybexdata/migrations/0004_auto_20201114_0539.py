# Generated by Django 3.1.2 on 2020-11-14 05:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cybexdata', '0003_profile_cybex_token'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='cybex_token',
            field=models.CharField(blank=True, max_length=50, verbose_name='CYBEX Token'),
        ),
    ]
