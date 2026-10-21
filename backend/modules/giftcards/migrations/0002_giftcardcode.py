from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('giftcards', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GiftCardCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=9, unique=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('is_redeemed', models.BooleanField(default=False)),
                ('redeemed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
