const API_BASE_URL = "http://127.0.0.1:8000";
console.log("DASHBOARD JS WORKING");

const PRODUCTS_API = `${API_BASE_URL}/api/products/`;
const PRODUCT_TYPES_API = `${API_BASE_URL}/api/product-types/`;
const CATEGORIES_API = `${API_BASE_URL}/api/categories/`;

const adminProductList = document.getElementById("adminProductList");
const productCount = document.getElementById("productCount");

const logoutBtn = document.getElementById("logoutBtn");
const addProductBtn = document.getElementById("addProductBtn");

const productFormModal = document.getElementById("productFormModal");
const formClose = document.getElementById("formClose");

const productForm = document.getElementById("productForm");
const formTitle = document.getElementById("formTitle");

const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");

const productType = document.getElementById("productType");
const productDescription = document.getElementById("productDescription");
const productImage = document.getElementById("productImage");

const productCamera = document.getElementById("productCamera");
const takePhotoBtn = document.getElementById("takePhotoBtn");
const newImagePreviewBox = document.getElementById("newImagePreviewBox");
const newProductImagePreview = document.getElementById("newProductImagePreview");

const currentImageBox = document.getElementById("currentImageBox");
const currentProductImage = document.getElementById("currentProductImage");

const formMessage = document.getElementById("formMessage");
const saveProductBtn = document.getElementById("saveProductBtn");

let editingProductId = null;

// ===============================
// MOBILE CAMERA
// ===============================

if (takePhotoBtn && productCamera) {

    takePhotoBtn.addEventListener("click", function () {
        productCamera.click();
    });

}


// ===============================
// CAMERA PHOTO SELECTED
// ===============================

if (productCamera) {

    productCamera.addEventListener("change", function () {

        const file = productCamera.files[0];

        if (!file) {
            return;
        }

        try {

            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(file);

            productImage.files = dataTransfer.files;

        } catch (error) {

            console.error("Camera image error:", error);

        }

        showNewImagePreview(file);

    });

}


// ===============================
// NORMAL IMAGE SELECT
// ===============================

if (productImage) {

    productImage.addEventListener("change", function () {

        const file = productImage.files[0];

        if (!file) {
            return;
        }

        showNewImagePreview(file);

    });

}


// ===============================
// IMAGE PREVIEW
// ===============================

function showNewImagePreview(file) {

    if (!newImagePreviewBox || !newProductImagePreview) {
        return;
    }

    const imageUrl = URL.createObjectURL(file);

    newProductImagePreview.src = imageUrl;

    newImagePreviewBox.classList.remove("hidden");

}

// ===============================
// ADMIN LOGIN CHECK
// ===============================

const isLoggedIn = localStorage.getItem("onesos_admin_logged_in");

if (isLoggedIn !== "true") {
    window.location.href = "admin.html";
}


// ===============================
// IMAGE URL
// ===============================

function getImageUrl(image) {

    if (!image) {
        return "icon.png";
    }

    if (image.startsWith("http")) {
        return image;
    }

    return `${API_BASE_URL}${image}`;
}


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadAdminProducts() {

    try {

        adminProductList.innerHTML = `
            <div class="admin-loading">
                <div class="loader"></div>
                <p>Loading products...</p>
            </div>
        `;

        const response = await fetch(PRODUCTS_API);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        const products = Array.isArray(data)
            ? data
            : data.results || [];

        renderAdminProducts(products);

    } catch (error) {

        console.error("Dashboard product error:", error);

        adminProductList.innerHTML = `
            <div class="admin-empty">
                <h3>Unable to load products</h3>
                <p>Make sure Django server is running.</p>
            </div>
        `;
    }
}


// ===============================
// DISPLAY PRODUCTS
// ===============================

function renderAdminProducts(products) {

    productCount.textContent =
        `${products.length} Product${products.length !== 1 ? "s" : ""}`;

    if (products.length === 0) {

        adminProductList.innerHTML = `
            <div class="admin-empty">
                <h3>No Products Yet</h3>
                <p>Click "+ Add Product" to create your first product.</p>
            </div>
        `;

        return;
    }

    adminProductList.innerHTML = "";

    products.forEach(product => {

        const row = document.createElement("div");

        row.className = "admin-product-row";

        const typeName =
            product.product_type &&
            product.product_type.name
                ? product.product_type.name
                : "No Type";

        const categoryName =
            product.category &&
            product.category.name
                ? product.category.name
                : "No Category";

        row.innerHTML = `

            <div class="admin-product-image">

                <img
                    src="${getImageUrl(product.image)}"
                    alt="${escapeHtml(product.name)}"
                >

            </div>


            <div class="admin-product-info">

                <h3>${escapeHtml(product.name)}</h3>

                <span>${escapeHtml(categoryName)}</span>

            </div>


            <div class="admin-product-type">

                ${escapeHtml(typeName)}

            </div>


            <div class="admin-product-actions">

                <button
                    class="edit-btn"
                    type="button"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    type="button"
                >
                    Delete
                </button>

            </div>
        `;


        // EDIT
        row.querySelector(".edit-btn")
            .addEventListener("click", function () {

                editProduct(product);

            });


        // DELETE
        row.querySelector(".delete-btn")
            .addEventListener("click", function () {

                deleteProduct(product);

            });


        adminProductList.appendChild(row);

    });
}


// ===============================
// LOAD PRODUCT TYPES
// ===============================

// LOAD CATEGORIES
async function loadCategories(selectedCategoryId = null) {
    try {
        productCategory.innerHTML = `
            <option value="">Loading categories...</option>
        `;

        const response = await fetch(CATEGORIES_API);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        const categories =
            Array.isArray(data)
                ? data
                : data.results || [];

        productCategory.innerHTML = `
            <option value="">Select Category</option>
        `;

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            if (
                selectedCategoryId &&
                Number(selectedCategoryId) === Number(category.id)
            ) {
                option.selected = true;
            }

            productCategory.appendChild(option);
        });

    } catch (error) {
        console.error("Category loading error:", error);

        productCategory.innerHTML = `
            <option value="">Unable to load categories</option>
        `;
    }
}


// LOAD PRODUCT TYPES BY CATEGORY
async function loadProductTypes(
    selectedCategoryId = null,
    selectedTypeId = null
) {
    try {
        productType.innerHTML = `
            <option value="">Loading types...</option>
        `;

        if (!selectedCategoryId) {
            productType.innerHTML = `
                <option value="">Select Category First</option>
            `;
            return;
        }

        const response = await fetch(PRODUCT_TYPES_API);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        const types =
            Array.isArray(data)
                ? data
                : data.results || [];

        const filteredTypes = types.filter(type =>
            Number(type.category) === Number(selectedCategoryId)
        );

        productType.innerHTML = `
            <option value="">Select Type</option>
        `;

        filteredTypes.forEach(type => {
            const option = document.createElement("option");

            option.value = type.id;
            option.textContent = type.name;

            if (
                selectedTypeId &&
                Number(selectedTypeId) === Number(type.id)
            ) {
                option.selected = true;
            }

            productType.appendChild(option);
        });

        if (filteredTypes.length === 0) {
            productType.innerHTML = `
                <option value="">No Types Available</option>
            `;
        }

    } catch (error) {
        console.error("Product type loading error:", error);

        productType.innerHTML = `
            <option value="">Unable to load types</option>
        `;
    }
}

        


// ===============================
// OPEN ADD PRODUCT
async function openAddProduct() {
    editingProductId = null;

    formTitle.textContent = "Add New Product";
    saveProductBtn.textContent = "ADD PRODUCT";

    productForm.reset();
    formMessage.textContent = "";

    currentImageBox.classList.add("hidden");
    currentProductImage.src = "";
    productImage.value = "";

    // Load categories
    await loadCategories();

    // Reset product type
    productType.innerHTML = `
        <option value="">Select Category First</option>
    `;

    productFormModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

// ===============================
// OPEN EDIT PRODUCT
async function editProduct(product) {
    editingProductId = product.id;

    formTitle.textContent = "Edit Product";
    saveProductBtn.textContent = "UPDATE PRODUCT";
    formMessage.textContent = "";

    productName.value = product.name || "";
    productDescription.value = product.description || "";
    productImage.value = "";

    // Current image
    if (product.image) {
        currentProductImage.src = getImageUrl(product.image);
        currentImageBox.classList.remove("hidden");
    } else {
        currentImageBox.classList.add("hidden");
        currentProductImage.src = "";
    }

    // Get category ID
    const selectedCategoryId =
        product.category
            ? product.category.id
            : (
                product.product_type
                    ? product.product_type.category
                    : null
            );

    // Get product type ID
    const selectedTypeId =
        product.product_type
            ? product.product_type.id
            : null;

    // Load category and select current category
    await loadCategories(selectedCategoryId);

    // Load only types from selected category
    await loadProductTypes(
        selectedCategoryId,
        selectedTypeId
    );

    // Open modal
    productFormModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

// ===============================
// CLOSE FORM
// ===============================

function closeProductForm() {

    productFormModal.classList.add("hidden");

    document.body.style.overflow = "";

    editingProductId = null;

    productForm.reset();

    formMessage.textContent = "";

    currentImageBox.classList.add("hidden");

}


// ===============================
// SAVE PRODUCT
// ===============================

async function saveProduct(event) {

    event.preventDefault();

    formMessage.textContent = "";

    const name = productName.value.trim();

    const typeId = productType.value;

    const description = productDescription.value.trim();

    const imageFile = productImage.files[0];


    if (!name) {

        formMessage.textContent = "Please enter product name.";

        return;
    }


    if (!typeId) {

        formMessage.textContent = "Please select product type.";

        return;
    }


    if (!description) {

        formMessage.textContent = "Please enter description.";

        return;
    }


    // FormData for image upload
    const formData = new FormData();

    formData.append("name", name);

    formData.append("description", description);

    formData.append("product_type_id", typeId);


    // Image only if selected
    if (imageFile) {

        formData.append("image", imageFile);

    }


    try {

        saveProductBtn.disabled = true;

        saveProductBtn.textContent =
            editingProductId
                ? "UPDATING..."
                : "ADDING...";


        let response;


        // =========================
        // EDIT
        // =========================

        if (editingProductId) {

            response = await fetch(
                `${PRODUCTS_API}${editingProductId}/`,
                {
                    method: "PATCH",
                    body: formData
                }
            );

        }

        // =========================
        // ADD
        // =========================

        else {

            response = await fetch(
                PRODUCTS_API,
                {
                    method: "POST",
                    body: formData
                }
            );

        }


        const result = await response.json();


        if (!response.ok) {

            console.error("Server response:", result);

            throw new Error(
                result.detail ||
                result.error ||
                "Unable to save product."
            );

        }


        // Success
        formMessage.textContent =
            editingProductId
                ? "Product updated successfully."
                : "Product added successfully.";


        // Reload product list
        await loadAdminProducts();


        // Close after small delay
        setTimeout(() => {

            closeProductForm();

        }, 700);


    } catch (error) {

        console.error("Save product error:", error);

        formMessage.textContent =
            error.message || "Something went wrong.";

    } finally {

        saveProductBtn.disabled = false;

        saveProductBtn.textContent =
            editingProductId
                ? "UPDATE PRODUCT"
                : "ADD PRODUCT";

    }
}


// ===============================
// DELETE PRODUCT
// ===============================

async function deleteProduct(product) {

    const confirmDelete = confirm(
        `Delete "${product.name}"?`
    );

    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${PRODUCTS_API}${product.id}/`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                `Delete failed: ${response.status}`
            );

        }


        alert("Product deleted successfully.");

        loadAdminProducts();


    } catch (error) {

        console.error("Delete error:", error);

        alert("Unable to delete product.");

    }
}


// ===============================
// ADD BUTTON
// ===============================

if (addProductBtn) {

    addProductBtn.addEventListener(
        "click",
        openAddProduct
    );

}


// ===============================
// FORM SUBMIT
// ===============================

if (productForm) {

    productForm.addEventListener(
        "submit",
        saveProduct
    );

}


// ===============================
// CLOSE BUTTON
// ===============================

if (formClose) {

    formClose.addEventListener(
        "click",
        closeProductForm
    );

}


// ===============================
// CLICK OUTSIDE MODAL
// ===============================

if (productFormModal) {

    productFormModal.addEventListener(
        "click",
        function (event) {

            if (event.target === productFormModal) {

                closeProductForm();

            }

        }
    );

}


// ===============================
// ESC KEY
// ===============================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeProductForm();

        }

    }
);


// ===============================
// LOGOUT
// ===============================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "onesos_admin_logged_in"
            );

            window.location.href = "admin.html";

        }
    );

}


// ===============================
// ESCAPE HTML
// ===============================

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


// ===============================
// START
// ===============================

loadAdminProducts();



// CATEGORY CHANGE
if (productCategory) {
    productCategory.addEventListener(
        "change",
        function () {
            const categoryId = productCategory.value;

            loadProductTypes(categoryId);
        }
    );
}