document.addEventListener("DOMContentLoaded", () => {
    // Get cart from localStorage
    function getCart() {
      return JSON.parse(localStorage.getItem("fascoCart")) || []
    }
  
    // Format price to 2 decimal places with $ sign
    function formatPrice(price) {
      return "$" + Number.parseFloat(price).toFixed(2)
    }
  
    // Update copyright year
    const yearElements = document.querySelectorAll(".footer-bottom p")
    yearElements.forEach((element) => {
      const text = element.textContent
      const updatedText = text.replace(/\d{4}/, new Date().getFullYear())
      element.textContent = updatedText
    })
  
    // Load cart data and update checkout page
    function loadCheckoutData() {
      const cart = getCart()
      const productContainer = document.querySelector(".product-item")
      const subtotalElement = document.querySelector(".price-row:first-child span:last-child")
      const shippingElement = document.querySelector(".price-row:nth-child(2) span:last-child")
      const totalElement = document.querySelector(".price-row.total span:last-child")
  
      if (cart.length > 0) {
        // Calculate subtotal from cart
        let subtotal = 0
        let itemCount = 0
  
        cart.forEach((item) => {
          subtotal += item.price * item.quantity
          itemCount += item.quantity
        })
  
        // Update product display
        if (productContainer && cart[0]) {
          const item = cart[0]
          productContainer.innerHTML = `
                      <div class="product-image">
                          <img src="${item.image || "images/placeholder-dress.jpg"}" alt="${item.name}">
                          <span class="product-count">${item.quantity}</span>
                      </div>
                      <div class="product-details">
                          <h3>${item.name}</h3>
                          <p>${item.color}</p>
                      </div>
                      <div class="product-price">${formatPrice(item.price)}</div>
                  `
  
          // If there are more items, add a message
          if (cart.length > 1) {
            const additionalItems = document.createElement("div")
            additionalItems.className = "additional-items"
            additionalItems.textContent = `+ ${cart.length - 1} more item(s)`
            productContainer.parentNode.insertBefore(additionalItems, productContainer.nextSibling)
          }
        }
  
        // Update price elements
        if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal)
  
        // Calculate total
        const shipping = shippingElement ? Number.parseFloat(shippingElement.textContent.replace("$", "")) : 40.0
        const total = subtotal + shipping
  
        if (totalElement) totalElement.textContent = formatPrice(total)
  
        // Update cart count in header
        const cartCount = document.querySelector(".cart-count")
        if (cartCount) cartCount.textContent = itemCount.toString()
      } else {
        // Handle empty cart
        if (productContainer) {
          productContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>'
        }
        if (subtotalElement) subtotalElement.textContent = "$0.00"
        if (totalElement) totalElement.textContent = "$0.00"
      }
    }
  
    // Apply discount code
    const discountButton = document.querySelector(".discount-code .btn")
    if (discountButton) {
      discountButton.addEventListener("click", () => {
        const discountInput = document.querySelector(".discount-code .form-input")
        if (discountInput && discountInput.value.trim().toLowerCase() === "fasco10") {
          const subtotalElement = document.querySelector(".price-row:first-child span:last-child")
          const subtotal = Number.parseFloat(subtotalElement.textContent.replace("$", ""))
          const discountedSubtotal = subtotal * 0.9 // 10% discount
  
          subtotalElement.textContent = formatPrice(discountedSubtotal)
          updateTotal()
  
          alert("Discount applied successfully!")
        } else {
          alert("Invalid discount code")
        }
      })
    }
  
    // Calculate total price
    const updateTotal = () => {
      const subtotalElement = document.querySelector(".price-row:first-child span:last-child")
      const shippingElement = document.querySelector(".price-row:nth-child(2) span:last-child")
      const totalElement = document.querySelector(".price-row.total span:last-child")
  
      if (subtotalElement && shippingElement && totalElement) {
        const subtotal = Number.parseFloat(subtotalElement.textContent.replace("$", ""))
        const shipping = Number.parseFloat(shippingElement.textContent.replace("$", ""))
        const total = subtotal + shipping
  
        totalElement.textContent = formatPrice(total)
      }
    }
  
    // Form validation for payment
    const payButton = document.querySelector(".btn-full")
    if (payButton) {
      payButton.addEventListener("click", (e) => {
        e.preventDefault()
  
        const cardNumber = document.querySelector('input[placeholder="Card Number"]').value
        const expirationDate = document.querySelector('input[placeholder="Expiration Date"]').value
        const securityCode = document.querySelector('input[placeholder="Security Code"]').value
        const cardHolder = document.querySelector('input[placeholder="Card Holder Name"]').value
  
        if (!cardNumber || !expirationDate || !securityCode || !cardHolder) {
          alert("Please fill in all payment details")
          return
        }
  
        // Simple validation for card number (16 digits)
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
          alert("Please enter a valid 16-digit card number")
          return
        }
  
        // Simple validation for expiration date (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
          alert("Please enter expiration date in MM/YY format")
          return
        }
  
        // Simple validation for security code (3 digits)
        if (!/^\d{3}$/.test(securityCode)) {
          alert("Please enter a valid 3-digit security code")
          return
        }
  
        alert("Payment successful! Thank you for your order.")
  
        // Clear cart after successful payment
        localStorage.removeItem("fascoCart")
      })
    }
  
    // Initialize the checkout page
    loadCheckoutData()
  })
  
  