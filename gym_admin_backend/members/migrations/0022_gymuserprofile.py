from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def create_owner_profiles(apps, schema_editor):
    User = apps.get_model(*settings.AUTH_USER_MODEL.split('.'))
    GymUserProfile = apps.get_model('members', 'GymUserProfile')
    for user in User.objects.iterator():
        GymUserProfile.objects.get_or_create(user_id=user.id, defaults={'role': 'owner'})


def remove_owner_profiles(apps, schema_editor):
    GymUserProfile = apps.get_model('members', 'GymUserProfile')
    GymUserProfile.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('members', '0021_add_performance_indexes'),
    ]

    operations = [
        migrations.CreateModel(
            name='GymUserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('owner', 'Owner'), ('trainer', 'Trainer'), ('front_desk', 'Front Desk')], default='owner', max_length=20)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='gym_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.RunPython(create_owner_profiles, remove_owner_profiles),
    ]
