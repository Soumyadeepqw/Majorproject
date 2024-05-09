from django.db import models
from django.contrib.auth.models import User


class Product(models.Model):
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    discount = models.DecimalField(
        max_digits=5, decimal_places=2, null=True
    )  # Make discount nullable
    image_url = models.URLField()
    color = models.CharField(max_length=100, null=True)
    gender = models.CharField(max_length=20, null=True)
    category = models.CharField(max_length=100)
    tags = models.CharField(max_length=255, null=True)
    sizes = models.CharField(max_length=50, null=True)
    warranty = models.CharField(max_length=50, null=True)

class Preference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    suggested_products = models.CharField(
        max_length=255, null=True, blank=True
    )  # Stores comma-separated product IDs


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    date_added = models.DateTimeField(auto_now_add=True)
    
class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1) 
    date_added = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    review_text = models.TextField()
    rating = models.DecimalField(max_digits=2, decimal_places=1)
    created_at = models.DateTimeField(auto_now_add=True) 

def __str__(self):
    return self.name
