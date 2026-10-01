from rest_framework import serializers
from .models import Product, Category, ProductType


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "image",
            "created_at",
            "updated_at"
        ]


class ProductTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductType
        fields = [
            "id",
            "name",
            "description",
            "image",
            "created_at",
            "updated_at",
            "category"
        ]


class ProductSerializer(serializers.ModelSerializer):

    # Display category details
    category = CategorySerializer(read_only=True)

    # Display product type details
    product_type = ProductTypeSerializer(read_only=True)

    # For adding/editing product
    product_type_id = serializers.PrimaryKeyRelatedField(
        source="product_type",
        queryset=ProductType.objects.all(),
        write_only=True,
        required=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "category",
            "product_type",
            "product_type_id",
            "image",
            "created_at",
            "updated_at"
        ]

    def create(self, validated_data):
        product_type = validated_data.get("product_type")

        # Automatically get category from Product Type
        if product_type:
            validated_data["category"] = product_type.category

        return super().create(validated_data)

    def update(self, instance, validated_data):
        product_type = validated_data.get("product_type")

        # Automatically update category
        if product_type:
            validated_data["category"] = product_type.category

        return super().update(instance, validated_data)