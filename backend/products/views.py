from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product, Category, ProductType
from .serializers import (
    ProductSerializer,
    CategorySerializer,
    ProductTypeSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):

    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer

    parser_classes = [MultiPartParser, FormParser]


class ProductTypeViewSet(viewsets.ModelViewSet):

    queryset = ProductType.objects.all().order_by("name")
    serializer_class = ProductTypeSerializer

    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = ProductType.objects.all().order_by("name")

        category_id = self.request.query_params.get("category")

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset


class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer

    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Product.objects.all().order_by("-created_at")

        category_id = self.request.query_params.get("category")
        product_type_id = self.request.query_params.get("product_type")

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if product_type_id:
            queryset = queryset.filter(product_type_id=product_type_id)

        return queryset