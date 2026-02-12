from django.db import models
from django.db.models.deletion import SET_DEFAULT

# Create your models here.
class Member(models.Model):
    name = models.CharField(max_length=50)
    phone_number = models.IntegerField()
    email =models.EmailField(null=True,unique=True)

    def __str__(self) :
        return self.name