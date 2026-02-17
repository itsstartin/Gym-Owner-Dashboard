from django.db import models
from django.core.validators import RegexValidator
from django.db.models.deletion import SET_DEFAULT

phone_regex = RegexValidator(
    regex=r'^\+?\d{7,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)
# Create your models here.
class Member(models.Model):
    name = models.CharField(max_length=50)
    phone_number = models.CharField(
    validators=[phone_regex],
    max_length=16,
    unique=True
    )
    email =models.EmailField(null=True,unique=True)

    def __str__(self) :
        return self.name