from mzone_auth.views import login, signup, test_token
from django.urls import path, include
from mzone_products.views import (
    PRODUCTS,
    home_products,
    hero_products,
    new_products,
    search,
    toggle_favorite,
    favorites,
    cart,
    cart_add,
    cart_reduce,
    cart_delete,
    reviews,
    review_add,
    review_delete,
    product_by_id
)

urlpatterns = [
    path("login/", login),
    path("signup/", signup),
    path("test-token/", test_token),
    path("products/", PRODUCTS),
    path("product-by-id", product_by_id),
    path("products-home", home_products),
    path("products-hero", hero_products),
    path("products-new", new_products),
    path("search", search),
    path("toggle-favorite", toggle_favorite),
    path("favorites", favorites),
    path("cart", cart),
    path("cart-add", cart_add),
    path("cart-reduce", cart_reduce),
    path("cart-delete", cart_delete),
    path("reviews", reviews),
    path("review-add", review_add),
    path("review-delete", review_delete),
]
