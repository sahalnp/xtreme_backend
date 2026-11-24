from django.urls import path
from .views import (
    AdminLoginView,
    CategoryListCreateView,
    CategoryDetailView,
    ProductListCreateView,
    ProductDetailUpdateDeleteView,
    StoreStatsView,
)

urlpatterns = [
    path('auth/login/', AdminLoginView.as_view(), name='admin-login'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailUpdateDeleteView.as_view(), name='product-detail'),
    path('stats/', StoreStatsView.as_view(), name='store-stats'),
]

