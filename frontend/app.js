/* =========================================================
   ONESOS TRIM
   DIGITAL CATALOGUE
   CATEGORY → TYPE → PRODUCTS
========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";

const CATEGORIES_API = `${API_BASE_URL}/api/categories/`;
const PRODUCT_TYPES_API = `${API_BASE_URL}/api/product-types/`;
const PRODUCTS_API = `${API_BASE_URL}/api/products/`;


// =========================================================
// DOM ELEMENTS
// =========================================================

const categoryView = document.getElementById("categoryView");
const typeView = document.getElementById("typeView");
const productView = document.getElementById("productView");

const categoryGrid = document.getElementById("categoryGrid");
const typeGrid = document.getElementById("typeGrid");
const productGrid = document.getElementById("productGrid");

const backToCategories =
    document.getElementById("backToCategories");

const backToTypes =
    document.getElementById("backToTypes");

const selectedCategoryLabel =
    document.getElementById("selectedCategoryLabel");

const selectedCategoryTitle =
    document.getElementById("selectedCategoryTitle");

const selectedTypeLabel =
    document.getElementById("selectedTypeLabel");

const selectedTypeTitle =
    document.getElementById("selectedTypeTitle");


// =========================================================
// PRODUCT MODAL
// =========================================================

const productModal =
    document.getElementById("productModal");

const modalClose =
    document.getElementById("modalClose");

const modalProductImage =
    document.getElementById("modalProductImage");

const modalProductType =
    document.getElementById("modalProductType");

const modalProductName =
    document.getElementById("modalProductName");

const modalProductDescription =
    document.getElementById("modalProductDescription");

const modalWhatsApp =
    document.getElementById("modalWhatsApp");


// =========================================================
// DATA
// =========================================================

let allCategories = [];
let allProductTypes = [];
let allProducts = [];

let selectedCategory = null;
let selectedType = null;


// =========================================================
// IMAGE URL
// =========================================================

function getImageUrl(image) {

    if (!image) {
        return "icon.png";
    }

    image = String(image);

    // Full URL
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    // /media/products/image.jpg
    if (image.startsWith("/")) {
        return `${API_BASE_URL}${image}`;
    }

    // media/products/image.jpg
    return `${API_BASE_URL}/${image}`;
}


// =========================================================
// API DATA
// =========================================================

async function getApiData(url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `API Error ${response.status}: ${url}`
        );

    }

    const data = await response.json();

    // Normal DRF response
    if (Array.isArray(data)) {
        return data;
    }

    // DRF pagination response
    if (Array.isArray(data.results)) {
        return data.results;
    }

    return [];
}


// =========================================================
// LOAD CATALOGUE
// =========================================================

async function loadCatalogue() {

    try {

        showCategoryLoading();


        const categories =
            await getApiData(CATEGORIES_API);


        const productTypes =
            await getApiData(PRODUCT_TYPES_API);


        const products =
            await getApiData(PRODUCTS_API);


        allCategories = categories;
        allProductTypes = productTypes;
        allProducts = products;


        console.log(
            "================================="
        );

        console.log(
            "ONESOS CATALOGUE DATA"
        );

        console.log(
            "Categories:",
            allCategories
        );

        console.log(
            "Product Types:",
            allProductTypes
        );

        console.log(
            "Products:",
            allProducts
        );

        console.log(
            "================================="
        );


        renderCategories();


    } catch (error) {

        console.error(
            "Catalogue loading error:",
            error
        );


        if (categoryGrid) {

            categoryGrid.innerHTML = `

                <div class="loading-message">

                    <p>
                        Unable to load catalogue.
                    </p>

                    <small>
                        Please make sure Django server is running.
                    </small>

                </div>

            `;

        }

    }

}


// =========================================================
// RENDER CATEGORIES
// =========================================================

function renderCategories() {

    if (!categoryGrid) {
        return;
    }


    if (!allCategories.length) {

        categoryGrid.innerHTML = `

            <div class="loading-message">

                <p>
                    No categories available.
                </p>

            </div>

        `;

        return;
    }


    // =====================================================
    // A → Z SORTING
    // =====================================================

    const categories =
        [...allCategories].sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    )
        );


    categoryGrid.innerHTML = "";


    categories.forEach(
        (category, index) => {

            const card =
                document.createElement("article");


            card.className =
                "product-card catalogue-category-card";


            card.style.animationDelay =
                `${index * 0.08}s`;


            // Category image

            const categoryImage =
                category.image
                    ? getImageUrl(category.image)
                    : "icon.png";


            card.innerHTML = `

                <div class="product-card-image">

                    <img
                        src="${escapeHtml(categoryImage)}"
                        alt="${escapeHtml(category.name)}"
                        loading="lazy"
                        onerror="this.src='icon.png'"
                    >

                </div>


                <div class="product-card-content">

                    <span class="product-type">
                        CATEGORY
                    </span>


                    <h3>
                        ${escapeHtml(category.name)}
                    </h3>


                    <p>
                        ${escapeHtml(
                            category.description ||
                            "Explore our products."
                        )}
                    </p>


                    <span class="view-product">
                        View Collection →
                    </span>

                </div>

            `;


            // =================================================
            // CATEGORY CLICK
            // =================================================

            card.addEventListener(
                "click",
                function () {

                    openCategory(category);

                }
            );


            categoryGrid.appendChild(card);

        }
    );

}


// =========================================================
// OPEN CATEGORY
// =========================================================
// NEW SYSTEM:
//
// index.html
//      ↓
// category.html?id=8
//
// Example:
//
// POM POM → category.html?id=8
// =========================================================

function openCategory(category) {

    console.log(
        "CATEGORY CLICKED:",
        category
    );


    if (!category || !category.id) {

        console.error(
            "Invalid category:",
            category
        );

        return;
    }


    // Save selected category
    selectedCategory = category;
    selectedType = null;


    // =====================================================
    // OPEN SEPARATE CATEGORY PAGE
    // =====================================================

    window.location.href =
        `category.html?id=${category.id}`;

}


// =========================================================
// GET CATEGORY ID FROM TYPE
// =========================================================

function getCategoryIdFromType(type) {

    if (!type) {
        return null;
    }


    /*
        Django may return:

        category: 8

        OR

        category: {
            id: 8,
            name: "POM POM"
        }

        OR

        category_id: 8
    */


    if (
        type.category &&
        typeof type.category === "object"
    ) {

        return type.category.id;

    }


    if (
        type.category !== undefined &&
        type.category !== null
    ) {

        return type.category;

    }


    if (
        type.category_id !== undefined &&
        type.category_id !== null
    ) {

        return type.category_id;

    }


    return null;

}


// =========================================================
// RENDER PRODUCT TYPES
// =========================================================
// This function is kept for compatibility with the
// existing Home page code.
//
// New category page uses category.js.
// =========================================================

function renderProductTypes(category) {

    if (!typeGrid) {
        return;
    }


    if (!category) {

        typeGrid.innerHTML = `

            <div class="loading-message">

                <p>
                    No category selected.
                </p>

            </div>

        `;

        return;
    }


    console.log(
        "Selected Category ID:",
        category.id
    );


    let categoryTypes =
        allProductTypes.filter(
            function (type) {

                const typeCategoryId =
                    getCategoryIdFromType(type);


                return Number(typeCategoryId) ===
                    Number(category.id);

            }
        );


    // =====================================================
    // A → Z
    // =====================================================

    categoryTypes.sort(
        (a, b) =>
            String(a.name || "")
                .localeCompare(
                    String(b.name || ""),
                    undefined,
                    {
                        sensitivity: "base"
                    }
                )
    );


    typeGrid.innerHTML = "";


    if (!categoryTypes.length) {

        typeGrid.innerHTML = `

            <div class="loading-message">

                <p>
                    No product types available.
                </p>

                <small>
                    Category:
                    ${escapeHtml(category.name)}
                </small>

            </div>

        `;

        return;
    }


    categoryTypes.forEach(
        function (type, index) {

            const card =
                document.createElement("article");


            card.className =
                "product-card catalogue-type-card";


            card.style.animationDelay =
                `${index * 0.08}s`;


            const typeProducts =
                getProductsForType(type);


            card.innerHTML = `

                <div class="product-card-image type-card-image">

                    <div class="type-card-symbol">

                        ${escapeHtml(
                            getTypeInitial(type.name)
                        )}

                    </div>

                </div>


                <div class="product-card-content">

                    <span class="product-type">

                        ${escapeHtml(
                            category.name
                        )}

                    </span>


                    <h3>

                        ${escapeHtml(
                            type.name
                        )}

                    </h3>


                    <p>

                        ${typeProducts.length}

                        product
                        ${typeProducts.length !== 1 ? "s" : ""}

                        available

                    </p>


                    <span class="view-product">

                        View Products →

                    </span>

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    openProductType(
                        category,
                        type
                    );

                }
            );


            typeGrid.appendChild(card);

        }
    );

}


// =========================================================
// GET PRODUCT TYPE ID
// =========================================================

function getProductTypeId(product) {

    if (!product) {
        return null;
    }


    /*
        Django may return:

        product_type: 3

        OR

        product_type: {
            id: 3,
            name: "PP"
        }

        OR

        product_type_id: 3
    */


    if (
        product.product_type &&
        typeof product.product_type === "object"
    ) {

        return product.product_type.id;

    }


    if (
        product.product_type !== undefined &&
        product.product_type !== null
    ) {

        return product.product_type;

    }


    if (
        product.product_type_id !== undefined &&
        product.product_type_id !== null
    ) {

        return product.product_type_id;

    }


    return null;

}


// =========================================================
// GET PRODUCTS FOR TYPE
// =========================================================

function getProductsForType(type) {

    if (!type) {
        return [];
    }


    const typeId =
        Number(type.id);


    return allProducts.filter(
        function (product) {

            const productTypeId =
                getProductTypeId(product);


            return Number(productTypeId) ===
                typeId;

        }
    );

}


// =========================================================
// OPEN PRODUCT TYPE
// =========================================================
// Kept for compatibility with old Home catalogue view.
//
// New category.html uses category.js instead.
// =========================================================

function openProductType(
    category,
    type
) {

    console.log(
        "TYPE CLICKED:",
        type
    );


    selectedCategory = category;
    selectedType = type;


    if (selectedTypeLabel) {

        selectedTypeLabel.textContent =
            category.name || "PRODUCT TYPE";

    }


    if (selectedTypeTitle) {

        selectedTypeTitle.textContent =
            type.name || "Products";

    }


    const products =
        getProductsForType(type);


    renderProducts(products);


    // Hide category

    if (categoryView) {
        categoryView.classList.add("hidden");
    }


    // Hide types

    if (typeView) {
        typeView.classList.add("hidden");
    }


    // Show products

    if (productView) {
        productView.classList.remove("hidden");
    }


    window.location.hash =
        `type-${type.id}`;


    const productsSection =
        document.getElementById("products");


    if (productsSection) {

        productsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts(products) {

    if (!productGrid) {
        return;
    }


    productGrid.innerHTML = "";


    if (!products || !products.length) {

        productGrid.innerHTML = `

            <div class="loading-message">

                <p>
                    No products available in this type.
                </p>

            </div>

        `;

        return;
    }


    // =====================================================
    // A → Z SORTING
    // =====================================================

    const sortedProducts =
        [...products].sort(
            (a, b) =>
                String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    )
        );


    sortedProducts.forEach(
        function (product, index) {

            const card =
                document.createElement("article");


            card.className =
                "product-card";


            card.style.animationDelay =
                `${index * 0.08}s`;


            const productTypeName =
                getProductTypeName(product);


            card.innerHTML = `

                <div class="product-card-image">

                    <img
                        src="${escapeHtml(
                            getImageUrl(product.image)
                        )}"
                        alt="${escapeHtml(product.name)}"
                        loading="lazy"
                        onerror="this.src='icon.png'"
                    >

                </div>


                <div class="product-card-content">

                    <span class="product-type">

                        ${escapeHtml(
                            productTypeName
                        )}

                    </span>


                    <h3>

                        ${escapeHtml(
                            product.name
                        )}

                    </h3>


                    <p>

                        ${escapeHtml(
                            product.description || ""
                        )}

                    </p>


                    <span class="view-product">

                        View Product →

                    </span>

                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    openProductModal(product);

                }
            );


            productGrid.appendChild(card);

        }
    );

}


// =========================================================
// GET PRODUCT TYPE NAME
// =========================================================

function getProductTypeName(product) {

    if (!product) {
        return "Product";
    }


    if (
        product.product_type &&
        typeof product.product_type === "object" &&
        product.product_type.name
    ) {

        return product.product_type.name;

    }


    if (
        product.product_type_name
    ) {

        return product.product_type_name;

    }


    if (
        product.type_name
    ) {

        return product.type_name;

    }


    return "Product";

}


// =========================================================
// BACK TO CATEGORIES
// =========================================================

if (backToCategories) {

    backToCategories.addEventListener(
        "click",
        function () {

            selectedCategory = null;
            selectedType = null;


            if (typeView) {
                typeView.classList.add("hidden");
            }


            if (productView) {
                productView.classList.add("hidden");
            }


            if (categoryView) {
                categoryView.classList.remove("hidden");
            }


            window.location.hash = "products";


            const productsSection =
                document.getElementById("products");


            if (productsSection) {

                productsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// =========================================================
// BACK TO TYPES
// =========================================================

if (backToTypes) {

    backToTypes.addEventListener(
        "click",
        function () {

            if (!selectedCategory) {
                return;
            }


            selectedType = null;


            renderProductTypes(
                selectedCategory
            );


            if (productView) {
                productView.classList.add("hidden");
            }


            if (categoryView) {
                categoryView.classList.add("hidden");
            }


            if (typeView) {
                typeView.classList.remove("hidden");
            }


            window.location.hash =
                `category-${selectedCategory.id}`;

        }
    );

}


// =========================================================
// PRODUCT MODAL
// =========================================================

function openProductModal(product) {

    if (!productModal) {
        return;
    }


    if (modalProductImage) {

        modalProductImage.src =
            getImageUrl(product.image);

        modalProductImage.alt =
            product.name || "Product";

    }


    if (modalProductType) {

        modalProductType.textContent =
            getProductTypeName(product);

    }


    if (modalProductName) {

        modalProductName.textContent =
            product.name || "Product";

    }


    if (modalProductDescription) {

        modalProductDescription.textContent =
            product.description || "";

    }


    const message =
        `Hello OneSos Trim, I am interested in ${product.name || "this product"}. Please share the product details, price and availability.`;


    if (modalWhatsApp) {

        modalWhatsApp.href =
            `https://wa.me/?text=${encodeURIComponent(
                message
            )}`;

    }


    productModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";

}


// =========================================================
// CLOSE PRODUCT MODAL
// =========================================================

function closeProductModal() {

    if (!productModal) {
        return;
    }


    productModal.classList.add("hidden");

    document.body.style.overflow = "";

}


// =========================================================
// MODAL CLOSE BUTTON
// =========================================================

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeProductModal
    );

}


// =========================================================
// MODAL BACKGROUND CLICK
// =========================================================

if (productModal) {

    productModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === productModal
            ) {

                closeProductModal();

            }

        }
    );

}


// =========================================================
// ESC KEY
// =========================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeProductModal();

        }

    }
);


// =========================================================
// TYPE INITIAL
// =========================================================

function getTypeInitial(name) {

    if (!name) {
        return "P";
    }


    return String(name)
        .trim()
        .charAt(0)
        .toUpperCase();

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// LOADING
// =========================================================

function showCategoryLoading() {

    if (!categoryGrid) {
        return;
    }


    categoryGrid.innerHTML = `

        <div class="loading-message">

            <div class="loader"></div>

            <p>
                Loading categories...
            </p>

        </div>

    `;

}


// =========================================================
// START
// =========================================================

loadCatalogue();