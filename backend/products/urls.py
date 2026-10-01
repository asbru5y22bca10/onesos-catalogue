from rest_framework.routers import DefaultRouter

from .views import (
    ProductViewSet,
    CategoryViewSet,
    ProductTypeViewSet,
)


router = DefaultRouter()

router.register("categories", CategoryViewSet, basename="categories")
router.register("product-types", ProductTypeViewSet, basename="product-types")
router.register("products", ProductViewSet, basename="products")


urlpatterns = router.urls