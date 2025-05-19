document.addEventListener("DOMContentLoaded", () => {
  const API_URL = 'http://localhost:3000/api';
  let token = localStorage.getItem('token');
  let user = JSON.parse(localStorage.getItem('user'));

  // Check if user is logged in
  if (!token || !user) {
    window.location.href = 'signin.html';
    return;
  }

  // Check if user is admin
  if (user.role === 'admin') {
    window.location.href = 'admin.html';
    return;
  }

  // Get cart from API
  async function getCart() {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to get cart');
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  // Update cart count in header
  async function updateCartCount() {
    const cart = await getCart();
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
  }

  // Format price to 2 decimal places with $ sign
  function formatPrice(price) {
    return "$" + Number.parseFloat(price).toFixed(2);
  }

  // Render cart items
  async function renderCart() {
    const cart = await getCart();
    const cartTableBody = document.querySelector(".cart-table tbody");
    const cartContainer = document.querySelector(".cart-container");
    const subtotalElement = document.querySelector(".subtotal span:last-child");

    // Clear existing cart items
    if (cartTableBody) {
      cartTableBody.innerHTML = "";
    }

    if (cart.length === 0) {
      // Show empty cart message
      if (cartContainer) {
        cartContainer.innerHTML =
          '<h1 class="cart-title">Shopping Cart</h1><h2 style="text-align: center; margin: 50px 0;">Your cart is empty. <a href="shop.html">Start shopping now!</a></h2>';
      }
      return;
    }

    // Calculate subtotal
    let subtotal = 0;

    // Add each item to the cart
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      // Lấy id cartProduct đúng
      let cartProductId = item.cartProductId || item.id;
      console.log('Cart item.id:', item.id, 'cartProductId:', cartProductId);

      if (cartTableBody) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td data-label="Product">
            <div class="product-info">
              <div class="product-image">
                <img src="${item.image}" alt="${item.name}">
              </div>
              <div class="product-details">
                <h3>${item.name}</h3>
                <p class="product-color">Color: ${item.color}</p>
                <button class="remove-btn" data-id="${cartProductId}">Remove</button>
              </div>
            </div>
          </td>
          <td data-label="Price">${formatPrice(item.price)}</td>
          <td data-label="Quantity">
            <div class="quantity-control">
              <button class="quantity-btn decrease-btn" data-id="${cartProductId}">
                <i class="fas fa-minus"></i>
              </button>
              <input type="text" class="quantity-input" value="${item.quantity}" data-id="${cartProductId}" readonly>
              <button class="quantity-btn increase-btn" data-id="${cartProductId}">
                <i class="fas fa-plus"></i>
              </button>
            </div>
          </td>
          <td data-label="Total">${formatPrice(itemTotal)}</td>
        `;

        cartTableBody.appendChild(tr);
      }
    });

    // Update subtotal
    if (subtotalElement) {
      subtotalElement.textContent = formatPrice(subtotal);
    }

    // Add event listeners for quantity buttons and remove buttons
    addCartEventListeners();
  }

  // Add event listeners for cart interactions
  function addCartEventListeners() {
    // Quantity increase buttons
    document.querySelectorAll(".increase-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        const productId = this.getAttribute("data-id");
        try {
          const response = await fetch(`${API_URL}/cart/${productId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: 1 })
          });
          if (!response.ok) throw new Error('Failed to update quantity');
          renderCart();
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      });
    });

    // Quantity decrease buttons
    document.querySelectorAll(".decrease-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        const productId = this.getAttribute("data-id");
        // Lấy input số lượng hiện tại
        const input = document.querySelector(`.quantity-input[data-id='${productId}']`);
        const currentQuantity = parseInt(input.value);
        if (currentQuantity <= 1) return; // Không cho giảm về 0
        try {
          const response = await fetch(`${API_URL}/cart/${productId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: -1 })
          });
          if (!response.ok) throw new Error('Failed to update quantity');
          renderCart();
        } catch (error) {
          console.error('Error updating quantity:', error);
        }
      });
    });

    // Remove buttons
    document.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        const productId = this.getAttribute("data-id");
        try {
          const response = await fetch(`${API_URL}/cart/${productId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) throw new Error('Failed to remove item');
          renderCart();
        } catch (error) {
          console.error('Error removing item:', error);
        }
      });
    });

    // Checkout button
    const checkoutBtn = document.querySelector(".checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", async () => {
        const cart = await getCart();
        if (cart.length === 0) {
          alert("Your cart is empty. Please add items before checking out.");
          return;
        }
        window.location.href = "checkout.html";
      });
    }
  }

  // Initialize cart page
  const isCartPage = document.querySelector(".cart-table") !== null;

  if (isCartPage) {
    renderCart();
  } else {
    updateCartCount();
  }
});

