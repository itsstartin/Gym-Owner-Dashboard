# Generated manually for query patterns in dashboard, reports, and notifications.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('members', '0020_alter_recentpayment_created_at'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='member',
            index=models.Index(fields=['user', 'membership_start_date'], name='member_user_start_idx'),
        ),
        migrations.AddIndex(
            model_name='recentpayment',
            index=models.Index(fields=['user', 'created_at'], name='payment_user_created_idx'),
        ),
        migrations.AddIndex(
            model_name='recentpayment',
            index=models.Index(fields=['user', 'member', 'created_at'], name='payment_user_member_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'type', 'created_at'], name='notify_user_type_created_idx'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'member', 'type'], name='notify_user_member_type_idx'),
        ),
        migrations.AddIndex(
            model_name='attendance',
            index=models.Index(fields=['user', 'date'], name='attendance_user_date_idx'),
        ),
        migrations.AddIndex(
            model_name='attendance',
            index=models.Index(fields=['member', 'date'], name='attendance_member_date_idx'),
        ),
    ]
