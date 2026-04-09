const API_URL = 'https://script.google.com/macros/s/AKfycbw0XAf5u7jGBznrgaK-Ely280S6hvzPgcMRRggorAA-dz4m1dury2HjQq6sDL4oLYJV/exec'; 

let cart = [];

// 1. Fetch products from the Google Sheet
async function fetchProducts() {
    const grid = document.getElementById('product-grid');
    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
        grid.innerHTML = "<p>Error loading products. Check your URL and Sheet headers.</p>";
    }
}

// 2. Render items to the screen
function displayProducts(products) {
    const grid = document.getElementById('product-grid');
    // We use .map() to create the HTML for each piece of jewelry
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.ImageURL}" alt="${p.Name}">
            <h3>${p.Name}</h3>
            <p class="sku" style="font-size:0.7rem; color:#888;">SKU: ${p.SKU}</p>
            <p class="price">$${p.Price}</p>
            <button class="add-to-cart" onclick="addToCart('${p.SKU}', '${p.Name}', ${p.Price})">Add to Collection</button>
        </div>
    `).join('');
}

// 3. Shopping Cart Logic
function addToCart(sku, name, price) {
    cart.push({ sku, name, price });
    updateCartUI();
    toggleCart(true); 
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItems = document.getElementById('cart-items');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span>${item.name}</span>
            <span>$${item.price}</span>
        </div>
    `).join('');
    
    document.getElementById('total-price').innerText = total;
}

function toggleCart(forceOpen = false) {
    const sidebar = document.getElementById('cart-sidebar');
    if (forceOpen) sidebar.classList.add('active');
    else sidebar.classList.toggle('active');
}

// 4. Send Order Data (Synchronized with Backend)
async function checkout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    
    const customerName = prompt("Enter your Name:");
    const customerEmail = prompt("Enter your Email:");

    if(!customerName || !customerEmail) return;

    // This object MUST match what your Google Apps Script is expecting
    const order = {
        name: customerName,
        email: customerEmail,
        skus: cart.map(i => i.sku).join(', '), // Using 'skus' to match Backend logic
        total: document.getElementById('total-price').innerText
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(order)
        });

        alert("Order submitted successfully!");
        cart = [];
        updateCartUI();
        toggleCart();
    } catch (e) {
        alert("Check your Google Sheet—the order likely went through!");
    }
}

// Initialize the store
fetchProducts();
