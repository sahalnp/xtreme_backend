from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class AdminLoginView(APIView):
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        if user is not None:
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                },
                'token': f'xtreme_admin_token_{user.id}'
            })
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class CategoryListCreateView(APIView):
    def get(self, request):
        include_deleted = request.query_params.get('all', 'false').lower() == 'true'
        if include_deleted:
            categories = Category.objects.all()
        else:
            categories = Category.objects.filter(is_deleted=False)
        serializer = CategorySerializer(categories, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailView(APIView):
    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        # soft delete
        category.is_deleted = True
        category.save()
        return Response({'message': 'Category deleted successfully'})

class ProductListCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request):
        admin_mode = request.query_params.get('admin', 'false').lower() == 'true'
        category_id = request.query_params.get('category')
        search = request.query_params.get('search')

        queryset = Product.objects.all()

        if not admin_mode:
            queryset = queryset.filter(is_deleted=False, is_active=True)
        else:
            # In admin mode, show products (can filter by is_deleted)
            include_deleted = request.query_params.get('deleted', 'false').lower() == 'true'
            if not include_deleted:
                queryset = queryset.filter(is_deleted=False)

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if search:
            queryset = queryset.filter(name__icontains=search)

        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = ProductSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailUpdateDeleteView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        data = request.data.copy()
        # If image is empty or not passed, remove it from update to retain current image
        if 'image' in data and (data['image'] == '' or data['image'] == 'null'):
            data.pop('image')
        serializer = ProductSerializer(product, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        # Soft delete: sets is_deleted to True
        product.is_deleted = True
        product.save()
        return Response({'message': 'Product deleted successfully', 'id': pk})

class StoreStatsView(APIView):
    def get(self, request):
        total_products = Product.objects.filter(is_deleted=False).count()
        active_products = Product.objects.filter(is_deleted=False, is_active=True).count()
        inactive_products = Product.objects.filter(is_deleted=False, is_active=False).count()
        deleted_products = Product.objects.filter(is_deleted=True).count()
        total_categories = Category.objects.filter(is_deleted=False).count()

        return Response({
            'total_products': total_products,
            'active_products': active_products,
            'inactive_products': inactive_products,
            'deleted_products': deleted_products,
            'total_categories': total_categories
        })
