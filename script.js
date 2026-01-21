/* ============================================================
   Artistic E-Commerce Script (Vanilla JS)
   Features: Authentication, Theme, Admin CRUD, User Cart, Checkout, Invoice
   ============================================================ */

let currentRole = null;
let cart = [];

// -------------------- PAGE NAVIGATION --------------------
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    // Show cart controls only on user-related pages
    if (id === 'userPage' || id === 'cartPage' || id === 'checkoutPage' || id === 'invoicePage') {
        document.getElementById('userCartControls').classList.remove('hidden');
    } else {
        document.getElementById('userCartControls').classList.add('hidden');
    }
}

function goToLogin(role) {
    currentRole = role;
    sessionStorage.setItem("role", role);
    showPage('loginPage');
}

function goHome() {
    showPage('userPage');
    loadUserProducts();
}

// -------------------- AUTHENTICATION --------------------
function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (currentRole === 'admin' && user === '1234' && pass === '9603') {
        sessionStorage.setItem("loggedIn", "true");
        showPage('adminPage');
    } else if (currentRole === 'user' && user === 'user' && pass === 'user123') {
        sessionStorage.setItem("loggedIn", "true");
        showPage('userPage');
        loadUserProducts();
    } else {
        alert("Invalid credentials!");
    }
}

document.getElementById('logoutBtn').onclick = () => {
    sessionStorage.clear();
    cart = [];
    updateCartCount();
    showPage('roleSelection');
};

// -------------------- THEME TOGGLE --------------------
document.getElementById('themeToggle').onclick = () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('themeToggle').textContent =
        document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
};

// -------------------- ADMIN PANEL --------------------
document.getElementById('productForm').onsubmit = (e) => {
    e.preventDefault();
    const reader = new FileReader();
    const file = document.getElementById('productImage').files[0];

    reader.onload = () => {
        const product = {
            image: reader.result,
            name: document.getElementById('productName').value,
            price: document.getElementById('productPrice').value,
            qty: document.getElementById('productQty').value
        };
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        e.target.reset();
        alert("Product added successfully!");
    };
    reader.readAsDataURL(file);
};

// Load products into Admin Products Page
function loadAdminProductsPage() {
    const container = document.getElementById('adminProductsList');
    container.innerHTML = '';
    let products = JSON.parse(localStorage.getItem('products')) || [];

    products.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
      <img src="${p.image}" alt="Product image" onclick="changeProductImage(${i})">
      <h3 contenteditable="true" onblur="updateProduct(${i}, 'name', this.textContent)">${p.name}</h3>
      <p>Price: <span contenteditable="true" onblur="updateProduct(${i}, 'price', this.textContent)">${p.price}</span></p>
      <p>Qty: <span contenteditable="true" onblur="updateProduct(${i}, 'qty', this.textContent)">${p.qty}</span></p>
      <button onclick="deleteProduct(${i})" class="btn-glass">Delete</button>
    `;
        container.appendChild(card);
    });
}

function openAdminProductsPage() {
    showPage('adminProductsPage');
    loadAdminProductsPage();
}

function updateProduct(index, field, value) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products[index][field] = value.toString();
    localStorage.setItem('products', JSON.stringify(products));
}

function deleteProduct(index) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    loadAdminProductsPage();
}

function changeProductImage(index) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const reader = new FileReader();
        reader.onload = () => {
            let products = JSON.parse(localStorage.getItem('products')) || [];
            products[index].image = reader.result;
            localStorage.setItem('products', JSON.stringify(products));
            loadAdminProductsPage();
        };
        reader.readAsDataURL(input.files[0]);
    };
    input.click();
}

// -------------------- USER PANEL --------------------
function loadUserProducts() {
    const container = document.getElementById('userProducts');
    container.innerHTML = '';
    let products = JSON.parse(localStorage.getItem('products')) || [];

    products.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
      <img src="${p.image}" alt="Product image">
      <h3>${p.name}</h3>
      <p>Price: $${p.price}</p>
      <button onclick="addToCart(${i})" class="btn-glass">Add to Cart</button>
    `;
        container.appendChild(card);
    });
}

// -------------------- CART --------------------
function addToCart(index) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    cart.push(products[index]);
    updateCartCount();
    showPopup("Added to Cart!");
}

function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

document.getElementById('cartBtn').onclick = () => {
    showPage('cartPage');
    renderCart();
};

function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    let total = 0;

    cart.forEach((p, i) => {
        total += parseFloat(p.price);
        const item = document.createElement('div');
        item.className = 'product-card';
        item.innerHTML = `
      <img src="${p.image}" alt="Product image">
      <h3>${p.name}</h3>
      <p>Price: $${p.price}</p>
      <button onclick="removeFromCart(${i})" class="btn-glass">Remove</button>
    `;
        container.appendChild(item);
    });

    document.getElementById('totalPrice').textContent = "Total: $" + total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
}

// -------------------- CHECKOUT --------------------
function goToCheckout() {
    showPage('checkoutPage');
    const summary = document.getElementById('orderSummary');
    summary.innerHTML = '';
    let total = 0;

    cart.forEach(p => {
        total += parseFloat(p.price);
        summary.innerHTML += `<p>${p.name} - $${p.price}</p>`;
    });
    summary.innerHTML += `<h3>Total: $${total.toFixed(2)}</h3>`;
}

// -------------------- INVOICE --------------------
function goToInvoice() {
    showPage('invoicePage');
    const details = document.getElementById('invoiceDetails');
    details.innerHTML = '';
    let total = 0;

    cart.forEach(p => {
        total += parseFloat(p.price);
        details.innerHTML += `<p>${p.name} - $${p.price}</p>`;
    });

    document.getElementById('invoiceTotal').textContent = "Total: $" + total.toFixed(2);
}

// -------------------- POPUP NOTIFICATION --------------------
function showPopup(message) {
    const popup = document.getElementById('popup');
    popup.textContent = message;
    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 1500);
}
