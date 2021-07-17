from django.contrib import admin
from .models import *

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username')

class EmailAdmin(admin.ModelAdmin):
    list_display = ('user', 'sender', 'subject', 'read')

admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)

