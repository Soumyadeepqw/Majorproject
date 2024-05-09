from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Favorite, Product, CartItem, Review



class ProductSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = Product
        fields = "__all__"


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ("id", "user", "product", "date_added")


class ProductFavSerializer(serializers.ModelSerializer):
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "brand",
            "price",
            "rating",
            "discount",
            "image_url",
            "color",
            "gender",
            "category",
            "tags",
            "is_favorited",
            "sizes",
            "warranty"
            
        )

    def get_is_favorited(self, obj):
        user_id = self.context.get("user_id")
        if user_id:
            try:
                user = User.objects.get(pk=user_id)
                return Favorite.objects.filter(user=user, product=obj).exists()
            except User.DoesNotExist:
                return False  # User with provided ID not found
        else:
            return False

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()  # Nested serializer for product details

    class Meta:
        model = CartItem
        fields = ('id', 'user', 'product', 'quantity', 'date_added')
        
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True) 
    user_id = serializers.CharField(source='user.id', read_only=True) 

    class Meta:
        model = Review
        fields = ('id', 'user_name','user_id', 'review_text', 'rating', 'created_at')