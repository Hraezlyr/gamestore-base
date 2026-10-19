from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='RetroGame',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('total_chapters', models.PositiveIntegerField(default=10)),
                ('current_chapter', models.PositiveIntegerField(default=0)),
                ('progress_percentage', models.FloatField(default=0.0)),
            ],
        ),
    ]
    