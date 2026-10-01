const API_BASE = "http://127.0.0.1:8000/api";

const params = new URLSearchParams(window.location.search);
const typeId = params.get("type");

const typeName = document.getElementById("typeName");
const typeDescription = document.getElementById("typeDescription");
const productGrid = document.getElementById("productGrid");
const backToCategory = document.getElementById("backToCategory");


// ===============================
// LOAD PRODUCT TYPE
// ===============================

async function loadProductType() {

    if (!typeId) {

        typeName.textContent = "Product Type Not Found";

        typeDescription.textContent =
            "No product type was selected.";

        productGrid.innerHTML = `
            <div class="loading-box">
                <p>Invalid product type.</p>
            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(`${API_BASE}/product-types/`);

        if (!response.ok) {
            throw new Error("Failed to load product types");
        }

        const types = await response.json();


        const type = types.find(
            item => Number(item.id) === Number(typeId)
        );


        if (!type) {

            typeName.textContent =
                "Product Type Not Found";

            typeDescription.textContent =
                "The selected product type does not exist.";

            productGrid.innerHTML = `
                <div class="loading-box">
                    <p>Product type not found.</p>
                </div>
            `;

            return;
        }


        // Show type name
        typeName.textContent =
            type.name || "Products";


        typeDescription.textContent =
            type.description ||
            `Explore our ${type.name || ""} products.`;


        // Set Back button
        const categoryId =
            getCategoryId(type);


        if (categoryId) {

            backToCategory.href =
                `category.html?id=${categoryId}`;

        } else {

            backToCategory.href =
                "index.html";

        }


        // Load products
        await loadProducts();

    } catch (error) {

        console.error(error);

        typeName.textContent =
            "Unable to Load";

        typeDescription.textContent =
            "Please make sure the backend server is running.";

        productGrid.innerHTML = `
            <div class="loading-box">
                <p>Something went wrong.</p>
            </div>
        `;
    }
}



// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    productGrid.innerHTML = `
        <div class="loading-box">
            <div class="loader"></div>
            <p>Loading products...</p>
        </div>
    `;


    const response =
        await fetch(`${API_BASE}/products/`);


    if (!response.ok) {
        throw new Error("Failed to load products");
    }


    const products = await response.json();


    // Only products belonging to selected type
    const filteredProducts =
        products.filter(product => {

            let productTypeId = null;


            if (
                product.product_type &&
                typeof product.product_type === "object"
            ) {

                productTypeId =
                    product.product_type.id;

            } else if (
                product.product_type !== undefined &&
                product.product_type !== null
            ) {

                productTypeId =
                    product.product_type;

            } else if (
                product.product_type_id !== undefined &&
                product.product_type_id !== null
            ) {

                productTypeId =
                    product.product_type_id;
            }


            return Number(productTypeId) === Number(typeId);

        });


    // Alphabetical order
    filteredProducts.sort((a, b) =>
        String(a.name || "")
            .localeCompare(
                String(b.name || ""),
                undefined,
                {
                    sensitivity: "base"
                }
            )
    );


    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `
            <div class="loading-box">
                <p>No products available in this type.</p>
            </div>
        `;

        return;
    }


    productGrid.innerHTML = "";


    filteredProducts.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "catalogue-product-card";


        const image =
            getProductImage(product);


        card.innerHTML = `

            <div class="product-card-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy"
                >

            </div>


            <div class="product-card-content">

                <small class="eyebrow">
                    ${escapeHTML(
                        product.type_name ||
                        product.product_type_name ||
                        ""
                    )}
                </small>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(
                        product.description ||
                        "Product details available on enquiry."
                    )}
                </p>

                <span class="view-product">
                    View Details →
                </span>

            </div>

        `;


        card.addEventListener("click", () => {

            openProduct(product);

        });


        productGrid.appendChild(card);

    });

}



// ===============================
// PRODUCT DETAIL
// ===============================

function openProduct(product) {

    const modal =
        document.getElementById("productDetail");

    const detailImage =
        document.getElementById("detailImage");

    const detailType =
        document.getElementById("detailType");

    const detailName =
        document.getElementById("detailName");

    const detailDescription =
        document.getElementById("detailDescription");

    const detailWhatsApp =
        document.getElementById("detailWhatsApp");


    detailImage.src =
        getProductImage(product);

    detailImage.alt =
        product.name || "Product";


    detailType.textContent =
        product.type_name ||
        product.product_type_name ||
        "";


    detailName.textContent =
        product.name || "Product";


    detailDescription.textContent =
        product.description ||
        "Contact OneSos Trim for product details, samples, quantity and pricing.";


    const message =
        `Hello OneSos Trim, I am interested in ${product.name || "this product"}.`;


    detailWhatsApp.href =
        `https://wa.me/?text=${encodeURIComponent(message)}`;


    modal.classList.remove("hidden");

}



// ===============================
// CLOSE PRODUCT MODAL
// ===============================

const detailClose =
    document.getElementById("detailClose");


if (detailClose) {

    detailClose.addEventListener("click", () => {

        const modal =
            document.getElementById("productDetail");

        modal.classList.add("hidden");

    });

}


const productDetail =
    document.getElementById("productDetail");


if (productDetail) {

    productDetail.addEventListener("click", (event) => {

        if (event.target === productDetail) {

            productDetail.classList.add("hidden");

        }

    });

}



// ===============================
// GET CATEGORY ID
// ===============================

function getCategoryId(type) {

    if (!type) {
        return null;
    }


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



// ===============================
// GET PRODUCT IMAGE
// ===============================

function getProductImage(product) {

    let image =
        product.image ||
        product.image_url ||
        product.photo ||
        "";


    if (!image) {

        return "icon.png";

    }


    // If backend already gives full URL
    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;

    }


    // If image starts with /media/
    if (image.startsWith("/")) {

        return `http://127.0.0.1:8000${image}`;

    }


    return `http://127.0.0.1:8000/media/${image}`;

}



// ===============================
// SECURITY / TEXT HELPER
// ===============================

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}



// ===============================
// START
// ===============================

loadProductType();