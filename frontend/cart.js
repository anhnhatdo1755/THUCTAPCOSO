document.addEventListener("DOMContentLoaded", () => {
  // Get cart from localStorage
  function getCart() {
    return JSON.parse(localStorage.getItem("fascoCart")) || []
  }

  // Save cart to localStorage
  function saveCart(cart) {
    localStorage.setItem("fascoCart", JSON.stringify(cart))
    updateCartCount()
  }

  // Update cart count in header
  function updateCartCount() {
    const cart = getCart()
    const cartCount = document.querySelector(".cart-count")
    if (cartCount) {
      cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0)
    }
  }

  // Format price to 2 decimal places with $ sign
  function formatPrice(price) {
    return "$" + Number.parseFloat(price).toFixed(2)
  }

  // Render cart items
  function renderCart() {
    const cart = getCart()
    const cartTableBody = document.querySelector(".cart-table tbody")
    const cartContainer = document.querySelector(".cart-container")
    const subtotalElement = document.querySelector(".subtotal span:last-child")

    // Clear existing cart items
    if (cartTableBody) {
      cartTableBody.innerHTML = ""
    }

    if (cart.length === 0) {
      // Show empty cart message
      if (cartContainer) {
        cartContainer.innerHTML =
          '<h1 class="cart-title">Shopping Cart</h1><h2 style="text-align: center; margin: 50px 0;">Your cart is empty. <a href="shop.html">Start shopping now!</a></h2>'
      }
      return
    }

    // Calculate subtotal
    let subtotal = 0

    // Add each item to the cart
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal

      if (cartTableBody) {
        const tr = document.createElement("tr")
        tr.innerHTML = `
                    <td data-label="Product">
                        <div class="product-info">
                            <div class="product-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="product-details">
                                <h3>${item.name}</h3>
                                <p class="product-color">Color: ${item.color}</p>
                                <button class="remove-btn" data-index="${index}">Remove</button>
                            </div>
                        </div>
                    </td>
                    <td data-label="Price">${formatPrice(item.price)}</td>
                    <td data-label="Quantity">
                        <div class="quantity-control">
                            <button class="quantity-btn decrease-btn" data-index="${index}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="text" class="quantity-input" value="${item.quantity}" data-index="${index}" readonly>
                            <button class="quantity-btn increase-btn" data-index="${index}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </td>
                    <td data-label="Total">${formatPrice(itemTotal)}</td>
                `

        cartTableBody.appendChild(tr)
      }
    })

    // Update subtotal
    if (subtotalElement) {
      subtotalElement.textContent = formatPrice(subtotal)
    }

    // Add gift wrap cost if checked
    const giftWrapCheckbox = document.getElementById("gift-wrap-option")
    if (giftWrapCheckbox && giftWrapCheckbox.checked) {
      subtotal += 10.0
      if (subtotalElement) {
        subtotalElement.textContent = formatPrice(subtotal)
      }
    }

    // Add event listeners for quantity buttons and remove buttons
    addCartEventListeners()
  }

  // Add event listeners for cart interactions
  function addCartEventListeners() {
    // Quantity increase buttons
    document.querySelectorAll(".increase-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index")
        const cart = getCart()
        cart[index].quantity += 1
        saveCart(cart)
        renderCart()
      })
    })

    // Quantity decrease buttons
    document.querySelectorAll(".decrease-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index")
        const cart = getCart()
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1
          saveCart(cart)
          renderCart()
        }
      })
    })

    // Remove buttons
    document.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const index = this.getAttribute("data-index")
        const cart = getCart()
        cart.splice(index, 1)
        saveCart(cart)
        renderCart()
      })
    })

    // Gift wrap checkbox
    const giftWrapCheckbox = document.getElementById("gift-wrap-option")
    if (giftWrapCheckbox) {
      giftWrapCheckbox.addEventListener("change", () => {
        renderCart() // Update totals when gift wrap option changes
      })
    }

    // Checkout button
    const checkoutBtn = document.querySelector(".checkout-btn")
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        // Make sure we have items in the cart before proceeding to checkout
        const cart = getCart()
        if (cart.length === 0) {
          alert("Your cart is empty. Please add items before checking out.")
          return
        }
        window.location.href = "checkout.html"
      })
    }
  }

  // Initialize cart page
  // Check if we're on the cart page by looking for cart-specific elements
  const isCartPage = document.querySelector(".cart-table") !== null

  if (isCartPage) {
    // If no items in localStorage, add the default item from the HTML
    const cart = getCart()
    if (cart.length === 0) {
      const defaultItem = document.querySelector(".product-info h3")
      if (defaultItem) {
        const name = defaultItem.textContent
        const color = document.querySelector(".product-color").textContent.replace("Color: ", "")
        const price = Number.parseFloat(document.querySelector("[data-label='Price']").textContent.replace("$", ""))
        const quantity = Number.parseInt(document.querySelector(".quantity-input").value)
        const image = document.querySelector(".product-image img").src

        cart.push({
          name,
          color,
          price,
          quantity,
          image,
        })

        saveCart(cart)
      }
    }

    renderCart()
  } else {
    // Just update the cart count for non-cart pages
    updateCartCount()
  }
})

