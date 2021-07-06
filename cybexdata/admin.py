"""Module for Django user model administration."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Profile, Graphdb

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class GraphdbInline(admin.StackedInline):
    model = Graphdb
    can_delete = False
    verbose_name_plural = 'Graphdb'
    fk_name = 'user'


class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline, GraphdbInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_cybex_token', 'get_orgid', 'get_tzname', 'get_dbport', 'get_dbip', 'get_dbpass', 'get_dbuser', 'get_containerid')
    list_select_related = ('profile', )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2')}
        ),
    )

    def get_cybex_token(self, instance):
        return instance.profile.cybex_token
    get_cybex_token.short_description = 'CYBEX Token'

    def get_tzname(self, instance):
        return instance.profile.tzname
    get_tzname.short_description = 'Timezone Name'

    def get_orgid(self, instance):
        return instance.profile.orgid
    get_orgid.short_description = 'Organization ID'

    def get_dbport(self, instance):
        return instance.graphdb.dbport
    get_dbport.short_description = 'DB Port'

    def get_dbip(self, instance):
            return instance.graphdb.dbip
    get_dbip.short_description = 'DB IP'

    def get_dbpass(self, instance):
            return instance.graphdb.dbpass
    get_dbpass.short_description = 'DB Pass'

    def get_dbuser(self, instance):
            return instance.graphdb.dbuser
    get_dbuser.short_description = 'DB User'

    def get_containerid(self, instance):
            return instance.graphdb.containerid
    get_containerid.short_description = 'DB Container ID'


    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
