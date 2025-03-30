document.addEventListener("DOMContentLoaded", () => {
    // Size Filter Functionality
    const sizeButtons = document.querySelectorAll(".size-btn")
    sizeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Toggle active state
        sizeButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
      })
    })
  
    // Color Filter Functionality
    const colorButtons = document.querySelectorAll(".color-btn")
    colorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Toggle active state
        colorButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")
      })
    })
  
    // Price Range Slider
    const priceRangeInput = document.querySelector(".price-range input")
    const priceLabels = document.querySelector(".price-labels")
    priceRangeInput.addEventListener("input", () => {
      const value = priceRangeInput.value
      priceLabels.querySelector("span:last-child").textContent = `$${value}`
    })
  
    // View Mode Toggle
    const gridViewBtn = document.querySelector(".grid-view")
    const listViewBtn = document.querySelector(".list-view")
    const productListings = document.querySelector(".product-listings1")
  
    gridViewBtn.addEventListener("click", () => {
      gridViewBtn.classList.add("active")
      listViewBtn.classList.remove("active")
      productListings.classList.remove("list-view")
    })
  
    listViewBtn.addEventListener("click", () => {
      listViewBtn.classList.add("active")
      gridViewBtn.classList.remove("active")
      productListings.classList.add("list-view")
    })
  
    // Cart Functionality
    function getCart() {
      return JSON.parse(localStorage.getItem("fascoCart")) || []
    }
  
    function saveCart(cart) {
      localStorage.setItem("fascoCart", JSON.stringify(cart))
      updateCartCount()
    }
  
    function updateCartCount() {
      const cart = getCart()
      const cartCount = document.querySelector(".cart-count")
      if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0)
      }
    }
  
    // Initialize cart count on page load
    updateCartCount()
  
    // Quick View and Add to Cart Functionality
    const productCards = document.querySelectorAll(".product-card1")
    productCards.forEach((card) => {
      const detailBtn = card.querySelector(".Detail")
      const addToCartBtn = card.querySelector(".add-to-cart")
      const productName = card.querySelector(".product-info1 h3").textContent
      const productPrice = Number.parseFloat(card.querySelector(".product-price1").textContent.replace("$", ""))
      const productImage = card.querySelector(".product-image1 img").getAttribute("src")
  
      // Get the first color dot's background color
      const colorDot = card.querySelector(".color-dot")
      const productColor = colorDot ? window.getComputedStyle(colorDot).backgroundColor : "black"
  
      detailBtn.addEventListener("click", () => {
        // Get product information
        const productData = {
          name: productName,
          price: productPrice,
          image: productImage,
          color: productColor,
        }
  
        // Store product data in localStorage to access it on the detail page
        localStorage.setItem("selectedProduct", JSON.stringify(productData))
  
        // Navigate to the product detail page
        window.location.href = "sanpham.html"
      })
  
      addToCartBtn.addEventListener("click", () => {
        // Get current cart
        const cart = getCart()
  
        // Check if product already exists in cart
        const existingProductIndex = cart.findIndex((item) => item.name === productName && item.color === productColor)
  
        if (existingProductIndex >= 0) {
          // Increment quantity if product already exists
          cart[existingProductIndex].quantity += 1
        } else {
          // Add new product to cart
          cart.push({
            name: productName,
            price: productPrice,
            image: productImage,
            color: productColor,
            quantity: 1,
          })
        }
  
        // Save updated cart
        saveCart(cart)
  
        // Show confirmation
        const confirmationMessage = document.createElement("div")
        confirmationMessage.className = "cart-confirmation"
        confirmationMessage.innerHTML = `
                    <div class="cart-confirmation-content">
                        <p>${productName} added to cart!</p>
                        <a href="cart.html" class="view-cart">View Cart</a>
                    </div>
                `
        document.body.appendChild(confirmationMessage)
  
        // Remove confirmation after 3 seconds
        setTimeout(() => {
          confirmationMessage.remove()
        }, 3000)
      })
    })
  
    // Sorting Functionality
    const sortSelect = document.querySelector(".sort-options1 select")
    sortSelect.addEventListener("change", () => {
      const selectedOption = sortSelect.value
      const productCards = Array.from(document.querySelectorAll(".product-card1"))
  
      switch (selectedOption) {
        case "Price: Low to High":
          productCards.sort((a, b) => {
            const priceA = Number.parseFloat(a.querySelector(".product-price1").textContent.replace("$", ""))
            const priceB = Number.parseFloat(b.querySelector(".product-price1").textContent.replace("$", ""))
            return priceA - priceB
          })
          break
        case "Price: High to Low":
          productCards.sort((a, b) => {
            const priceA = Number.parseFloat(a.querySelector(".product-price1").textContent.replace("$", ""))
            const priceB = Number.parseFloat(b.querySelector(".product-price1").textContent.replace("$", ""))
            return priceB - priceA
          })
          break
        // Additional sorting logic can be added here
      }
  
      // Re-append sorted cards to maintain DOM order
      const productListings = document.querySelector(".product-listings1")
      productCards.forEach((card) => productListings.appendChild(card))
    })
  
    // Pagination
    const pageButtons = document.querySelectorAll(".page-btn")
    pageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        pageButtons.forEach((btn) => btn.classList.remove("active"))
  
        // Add active class to clicked button
        button.classList.add("active")
  
        // Placeholder for actual pagination logic
        alert(`Showing page ${button.textContent}`)
      })
    })
  })
  
  