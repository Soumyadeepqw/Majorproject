# import_data.py
from django.core.management.base import BaseCommand
from mzone_products.views import import_excel_data

class Command(BaseCommand):
    help = 'Imports data from Excel file'

    def handle(self, *args, **options):
        import_excel_data()
        self.stdout.write(self.style.SUCCESS('Data imported successfully'))
