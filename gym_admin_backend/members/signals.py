from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from members.models import GymUserProfile


@receiver(post_save, sender=User)
def create_gym_user_profile(sender, instance, created, **kwargs):
    if created:
        profile, _ = GymUserProfile.objects.get_or_create(user=instance)
        instance.gym_profile = profile
