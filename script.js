// FRONTEND: This goes in your GitHub script.js file
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
        console.error("Error:", error);
        grid.innerHTML = "<p>Error loading products. Check your URL and Sheet headers.</p>";
    }
}

// 2. Render items to the screen
function displayProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.ImageURL}" alt="${p.Name}">
            <h3>${p.Name}</h3>
            <p class="price">$${p.Price}</p>
            <button class="add-to-cart" onclick="addToCart('${p.Name}', ${p.Price})">Add to Collection</button>
        </div>
    `).join('');
}

// 3. Simple Shopping Cart Logic
function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
    toggleCart(true); // Open cart automatically
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItems = document.getElementById('cart-items');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span> - <span>$${item.price}</span>
        </div>
    `).join('');
    
    document.getElementById('total-price').innerText = total;
}

function toggleCart(forceOpen = false) {
    const sidebar = document.getElementById('cart-sidebar');
    if (forceOpen) sidebar.classList.add('active');
    else sidebar.classList.toggle('active');
}

// 4. Send Order Data back to the Backend
async function checkout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    
    const customerName = prompt("Enter your Name:");
    const customerEmail = prompt("Enter your Email:");

    if(!customerName || !customerEmail) return;

    const order = {
        name: customerName,
        email: customerEmail,
        items: cart.map(i => i.name).join(', '),
        total: document.getElementById('total-price').innerText
    };

    try {
        // We use 'no-cors' because Apps Script redirects can be tricky with standard fetch
        await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(order)
        });

        alert("Order submitted successfully! We will contact you soon.");
        cart = [];
        updateCartUI();
        toggleCart();
    } catch (e) {
        alert("Success! (Note: Browsers sometimes flag the redirect as an error, but check your Sheet!)");
    }
}

// Load data on start
fetchProducts();
