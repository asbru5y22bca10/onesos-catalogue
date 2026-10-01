from django.db import migrations, models
import django.db.models.deletion


def create_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")

    Category.objects.get_or_create(
        name="Crochet",
        defaults={
            "description": "Crochet hand work and machine work products."
        },
    )

    Category.objects.get_or_create(
        name="Button",
        defaults={
            "description": "Garment buttons and fashion buttons."
        },
    )

    Category.objects.get_or_create(
        name="Zipper",
        defaults={
            "description": "Different types of garment and fashion zippers."
        },
    )


def create_product_types(apps, schema_editor):
    Category = apps.get_model("products", "Category")
    ProductType = apps.get_model("products", "ProductType")

    crochet = Category.objects.get(name="Crochet")

    ProductType.objects.get_or_create(
        category_id=crochet.id,
        name="Handmade",
        defaults={
            "description": "Handmade crochet designs."
        },
    )

    ProductType.objects.get_or_create(
        category_id=crochet.id,
        name="Machine Made",
        defaults={
            "description": "Machine made crochet designs."
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [

        # =========================================================
        # CATEGORY MODEL
        # =========================================================
        # products_category already exists in MySQL.
        # Tell Django about the existing table without creating it.
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.CreateModel(
                    name="Category",
                    fields=[
                        (
                            "id",
                            models.AutoField(
                                auto_created=True,
                                primary_key=True,
                                serialize=False,
                                verbose_name="ID",
                            ),
                        ),
                        (
                            "name",
                            models.CharField(
                                max_length=100,
                                unique=True,
                            ),
                        ),
                        (
                            "description",
                            models.TextField(
                                blank=True,
                            ),
                        ),
                        (
                            "image",
                            models.ImageField(
                                blank=True,
                                null=True,
                                upload_to="categories/",
                            ),
                        ),
                        (
                            "created_at",
                            models.DateTimeField(
                                auto_now_add=True,
                            ),
                        ),
                        (
                            "updated_at",
                            models.DateTimeField(
                                auto_now=True,
                            ),
                        ),
                    ],
                    options={
                        "verbose_name": "Category",
                        "verbose_name_plural": "Categories",
                    },
                ),
            ],
        ),

        # =========================================================
        # EXISTING CATEGORIES
        # =========================================================

        migrations.RunPython(
            create_categories,
            migrations.RunPython.noop,
        ),

        # =========================================================
        # PRODUCT CATEGORY STATE
        # =========================================================
        # The database already has:
        #
        # products_product.category_id INT
        #
        # and it already contains the correct Category IDs.
        #
        # Therefore we ONLY change Django's migration state here.
        # We do NOT create/drop/rename the database column.
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.RemoveField(
                    model_name="product",
                    name="category",
                ),
                migrations.AddField(
                    model_name="product",
                    name="new_category",
                    field=models.ForeignKey(
                        to="products.category",
                        on_delete=django.db.models.deletion.CASCADE,
                        null=True,
                        blank=True,
                        related_name="+",
                    ),
                ),
            ],
        ),

        # =========================================================
        # RENAME ONLY IN DJANGO STATE
        # =========================================================
        # The actual database column is already named category_id.
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[
                migrations.RenameField(
                    model_name="product",
                    old_name="new_category",
                    new_name="category",
                ),
            ],
        ),

        # =========================================================
        # FINAL CATEGORY FOREIGN KEY
        # =========================================================
        # This keeps the existing category_id column and makes
        # Django treat it as the final ForeignKey.
        migrations.AlterField(
            model_name="product",
            name="category",
            field=models.ForeignKey(
                to="products.category",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="products",
            ),
        ),

        # =========================================================
        # PRODUCT TYPE MODEL
        # =========================================================

        migrations.CreateModel(
            name="ProductType",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        max_length=100,
                    ),
                ),
                (
                    "description",
                    models.TextField(
                        blank=True,
                    ),
                ),
                (
                    "image",
                    models.ImageField(
                        upload_to="product_types/",
                        blank=True,
                        null=True,
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                    ),
                ),
                (
                    "category",
                    models.ForeignKey(
                        to="products.category",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="product_types",
                    ),
                ),
            ],
        ),

        # =========================================================
        # PRODUCT TYPE FIELD
        # =========================================================

        migrations.AddField(
            model_name="product",
            name="product_type",
            field=models.ForeignKey(
                to="products.producttype",
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="products",
                blank=True,
                null=True,
            ),
        ),

        # =========================================================
        # DEFAULT CROCHET TYPES
        # =========================================================

        migrations.RunPython(
            create_product_types,
            migrations.RunPython.noop,
        ),
    ]