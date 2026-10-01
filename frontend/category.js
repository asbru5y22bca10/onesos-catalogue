const API_BASE = "http://127.0.0.1:8000/api";

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("id");

const categoryName = document.getElementById("categoryName");
const categoryDescription = document.getElementById("categoryDescription");
const typeGrid = document.getElementById("typeGrid");


async function loadCategory() {

    if (!categoryId) {

        categoryName.textContent = "Category Not Found";

        categoryDescription.textContent =
            "No category was selected.";

        typeGrid.innerHTML = `
            <div class="loading-box">
                <p>Invalid category.</p>
            </div>
        `;

        return;
    }


    try {

        // Load categories
        const categoryResponse =
            await fetch(`${API_BASE}/categories/`);

        if (!categoryResponse.ok) {
            throw new Error("Failed to load categories");
        }

        const categories =
            await categoryResponse.json();


        // Find selected category
        const category = categories.find(
            item => Number(item.id) === Number(categoryId)
        );


        if (!category) {

            categoryName.textContent = "Category Not Found";

            categoryDescription.textContent =
                "The selected category does not exist.";

            typeGrid.innerHTML = `
                <div class="loading-box">
                    <p>Category not found.</p>
                </div>
            `;

            return;
        }


        // Show category details
        categoryName.textContent =
            category.name || "Category";

        categoryDescription.textContent =
            category.description ||
            "Explore our product collection.";


        // Load product types
        await loadProductTypes();

    } catch (error) {

        console.error(error);

        categoryName.textContent = "Unable to Load";

        categoryDescription.textContent =
            "Please make sure the backend server is running.";

        typeGrid.innerHTML = `
            <div class="loading-box">
                <p>Something went wrong.</p>
            </div>
        `;
    }
}



async function loadProductTypes() {

    typeGrid.innerHTML = `
        <div class="loading-box">
            <div class="loader"></div>
            <p>Loading product types...</p>
        </div>
    `;


    const response =
        await fetch(`${API_BASE}/product-types/`);


    if (!response.ok) {
        throw new Error("Failed to load product types");
    }


    const types = await response.json();


    // Only show types belonging to this category
    const categoryTypes = types.filter(type => {

        let typeCategoryId = null;


        if (
            type.category &&
            typeof type.category === "object"
        ) {

            typeCategoryId = type.category.id;

        } else if (
            type.category !== undefined &&
            type.category !== null
        ) {

            typeCategoryId = type.category;

        } else if (
            type.category_id !== undefined &&
            type.category_id !== null
        ) {

            typeCategoryId = type.category_id;
        }


        return Number(typeCategoryId) === Number(categoryId);

    });


    // Alphabetical order
    categoryTypes.sort((a, b) =>
        String(a.name || "")
            .localeCompare(
                String(b.name || ""),
                undefined,
                {
                    sensitivity: "base"
                }
            )
    );


    if (categoryTypes.length === 0) {

        typeGrid.innerHTML = `
            <div class="loading-box">
                <p>No product types available.</p>
            </div>
        `;

        return;
    }


    typeGrid.innerHTML = "";


    categoryTypes.forEach(type => {

        const card =
            document.createElement("div");

        card.className =
            "category-type-card";


        card.innerHTML = `

           <div class="type-card-icon">
    <img
        src="${escapeHTML(getProductTypeImage(type))}"
        alt="${escapeHTML(type.name)}"
        onerror="this.src='icon.png'"
    >
</div>

            <div class="type-card-content">

                <h3>
                    ${escapeHTML(type.name)}
                </h3>

                <p>
                    Explore ${escapeHTML(type.name)}
                    products
                </p>

            </div>

            <div class="type-card-arrow">
                →
            </div>

        `;


        card.addEventListener("click", () => {

            window.location.href =
                `products.html?type=${type.id}`;

        });


        typeGrid.appendChild(card);

    });

}



function getTypeIcon(name) {

    const value =
        String(name || "").toLowerCase();


    if (value.includes("nylon")) {
        return "✦";
    }

    if (value.includes("acrylic")) {
        return "✧";
    }

    if (value.includes("polyester")) {
        return "◆";
    }

    if (value.includes("pp")) {
        return "◇";
    }

    if (value.includes("hand")) {
        return "✿";
    }

    if (value.includes("machine")) {
        return "◈";
    }


    return "●";
}



function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function getProductTypeImage(type) {

    let image =
        type.image ||
        type.image_url ||
        type.photo ||
        "";

    if (!image) {
        return "icon.png";
    }

    image = String(image);

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {
        return image;
    }

    if (image.startsWith("/")) {
        return `http://127.0.0.1:8000${image}`;
    }

    return `http://127.0.0.1:8000/media/${image}`;
}

loadCategory();