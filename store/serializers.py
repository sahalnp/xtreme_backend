from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active', 'is_deleted', 'created_at', 'updated_at', 'product_count']

    def get_product_count(self, obj):
        return obj.products.filter(is_deleted=False).count()

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'category',
            'category_name',
            'image',
            'image_url',
            'size',
            'color',
            'stock',
            'is_active',
            'is_deleted',
            'created_at',
            'updated_at',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

