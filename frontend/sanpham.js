document.addEventListener("DOMContentLoaded", () => {
  // Load product data from localStorage if available
  const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"))
  if (selectedProduct) {
    // Update product title
    const productTitle = document.querySelector(".product-title")
    if (productTitle) {
      productTitle.textContent = selectedProduct.name
    }

    // Update product price
    const currentPrice = document.querySelector(".current-price")
    if (currentPrice) {
      currentPrice.textContent = `$${selectedProduct.price.toFixed(2)}`
    }

    // Update main product image if it matches the expected format
    const mainImage = document.querySelector(".product-main-image img")
    if (mainImage && selectedProduct.image) {
      mainImage.src = selectedProduct.image
    }
  }

  // Add cart confirmation CSS to the page
  const style = document.createElement("style")
  style.textContent = `
      /* Cart confirmation message styles */
      .cart-confirmation {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #000;
        color: #fff;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .cart-confirmation-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
      }
      
      .cart-confirmation p {
        margin: 0;
      }
      
      /* Product buttons styles for related products */
      .product-buttons {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      
      .btn-detail, .btn-add-to-cart {
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
        text-align: center;
      }
      
      .btn-detail {
        background-color: #fff;
        color: #000;
        border: 1px solid #000;
      }
      
      .btn-add-to-cart {
        background-color: #000;
        color: #fff;
        border: 1px solid #000;
      }
      
      .btn-detail:hover {
        background-color: #f5f5f5;
      }
      
      .btn-add-to-cart:hover {
        background-color: #333;
      }
    `
  document.head.appendChild(style)

  // Function to show cart confirmation message
  function showCartConfirmation(message) {
    // Remove any existing confirmation
    const existingConfirmation = document.querySelector(".cart-confirmation")
    if (existingConfirmation) {
      existingConfirmation.remove()
    }

    // Create confirmation element
    const confirmation = document.createElement("div")
    confirmation.className = "cart-confirmation"

    const content = document.createElement("div")
    content.className = "cart-confirmation-content"

    const messageElement = document.createElement("p")
    messageElement.textContent = message

    content.appendChild(messageElement)
    confirmation.appendChild(content)

    // Add to body
    document.body.appendChild(confirmation)

    // Remove after 3 seconds
    setTimeout(() => {
      confirmation.style.opacity = "0"
      confirmation.style.transform = "translateX(100%)"
      confirmation.style.transition = "all 0.3s ease-out"

      setTimeout(() => {
        confirmation.remove()
      }, 300)
    }, 3000)
  }

  // Function to update cart count
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("fascoCart")) || []
    const cartCount = document.querySelector(".cart-count")
    if (cartCount) {
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
      cartCount.textContent = totalItems
      console.log("Cart count updated to:", totalItems)
    } else {
      console.log("Cart count element not found")
    }
  }

  // Initialize cart count on page load
  updateCartCount()

  // Thumbnail image selection
  const thumbnails = document.querySelectorAll(".thumbnail")
  const mainImage = document.querySelector(".product-main-image img")

  thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener("click", function () {
      // Remove active class from all thumbnails
      thumbnails.forEach((t) => t.classList.remove("active"))

      // Add active class to clicked thumbnail
      this.classList.add("active")

      // Update main image
      const thumbnailImg = this.querySelector("img")
      mainImage.src = thumbnailImg.src
    })
  })

  // Size selection
  const sizeOptions = document.querySelectorAll(".size-option")

  sizeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all size options
      sizeOptions.forEach((o) => o.classList.remove("active"))

      // Add active class to clicked option
      this.classList.add("active")
    })
  })

  // Color selection
  const colorOptions = document.querySelectorAll(".color-option")

  colorOptions.forEach((option) => {
    option.addEventListener("click", function () {
      // Remove active class from all color options
      colorOptions.forEach((o) => o.classList.remove("active"))

      // Add active class to clicked option
      this.classList.add("active")

      // Update color label
      const colorLabel = document.querySelector(".option-group label:nth-of-type(2)")
      let colorName = ""

      if (this.classList.contains("blue")) {
        colorName = "Blue"
      } else if (this.classList.contains("black")) {
        colorName = "Black"
      } else if (this.classList.contains("pink")) {
        colorName = "Pink"
      }

      colorLabel.textContent = `Color: ${colorName}`
    })
  })

  // Quantity selector
  const minusBtn = document.querySelector(".quantity-btn.minus")
  const plusBtn = document.querySelector(".quantity-btn.plus")
  const quantityInput = document.querySelector(".quantity-input")

  minusBtn.addEventListener("click", () => {
    const currentValue = Number.parseInt(quantityInput.value)
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1
    }
  })

  plusBtn.addEventListener("click", () => {
    const currentValue = Number.parseInt(quantityInput.value)
    const maxStock = 9 // Based on the "Only 9 items left in stock"
    if (currentValue < maxStock) {
      quantityInput.value = currentValue + 1
    }
  })

  // Add to cart button
  const addToCartBtn = document.querySelector(".btn-add-to-cart")

  addToCartBtn.addEventListener("click", () => {
    const productTitle = document.querySelector(".product-title").textContent
    const quantity = Number.parseInt(quantityInput.value)
    const price = Number.parseFloat(document.querySelector(".current-price").textContent.replace("$", ""))
    const productImage = document.querySelector(".product-main-image img").src

    // Get selected size
    let selectedSize = "M" // Default
    sizeOptions.forEach((option) => {
      if (option.classList.contains("active")) {
        selectedSize = option.textContent
      }
    })

    // Get selected color
    let selectedColor = "Blue" // Default
    colorOptions.forEach((option) => {
      if (option.classList.contains("active")) {
        if (option.classList.contains("blue")) {
          selectedColor = "Blue"
        } else if (option.classList.contains("black")) {
          selectedColor = "Black"
        } else if (option.classList.contains("pink")) {
          selectedColor = "Pink"
        }
      }
    })

    // Create cart item object
    const cartItem = {
      name: productTitle,
      price: price,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      image: productImage,
    }

    // Get existing cart or create new one
    const cart = JSON.parse(localStorage.getItem("fascoCart")) || []

    // Check if product already exists in cart (same product, size and color)
    const existingItemIndex = cart.findIndex(
      (item) => item.name === cartItem.name && item.size === cartItem.size && item.color === cartItem.color,
    )

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.push(cartItem)
    }

    // Save cart to localStorage
    localStorage.setItem("fascoCart", JSON.stringify(cart))
    console.log("Cart saved to localStorage:", cart)

    // Update cart count
    updateCartCount()

    // Show custom confirmation message instead of alert
    showCartConfirmation(`Added to cart: ${quantity} x ${productTitle} (${selectedColor}, Size ${selectedSize})`)

    // Add a view cart button to the notification
    const viewCartBtn = document.createElement("a")
    viewCartBtn.href = "cart.html"
    viewCartBtn.textContent = "View Cart"
    viewCartBtn.style.color = "#fff"
    viewCartBtn.style.textDecoration = "underline"
    viewCartBtn.style.marginLeft = "10px"

    const notification = document.querySelector(".cart-confirmation-content")
    if (notification) {
      notification.appendChild(viewCartBtn)
    }
  })

  // Related products slider
  const prevArrow = document.querySelector(".slider-arrow.prev")
  const nextArrow = document.querySelector(".slider-arrow.next")
  const sliderDots = document.querySelectorAll(".slider-dot")

  // Simulate slider functionality
  prevArrow.addEventListener("click", () => {
    // Move active dot to previous
    let activeIndex = 0
    sliderDots.forEach((dot, index) => {
      if (dot.classList.contains("active")) {
        activeIndex = index
      }
    })

    sliderDots.forEach((dot) => dot.classList.remove("active"))

    if (activeIndex === 0) {
      sliderDots[sliderDots.length - 1].classList.add("active")
    } else {
      sliderDots[activeIndex - 1].classList.add("active")
    }
  })

  nextArrow.addEventListener("click", () => {
    // Move active dot to next
    let activeIndex = 0
    sliderDots.forEach((dot, index) => {
      if (dot.classList.contains("active")) {
        activeIndex = index
      }
    })

    sliderDots.forEach((dot) => dot.classList.remove("active"))

    if (activeIndex === sliderDots.length - 1) {
      sliderDots[0].classList.add("active")
    } else {
      sliderDots[activeIndex + 1].classList.add("active")
    }
  })

  sliderDots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      sliderDots.forEach((d) => d.classList.remove("active"))
      this.classList.add("active")
    })
  })

  // Function to show product details overlay
  function showProductDetails(product) {
    // Create overlay container
    const overlay = document.createElement("div")
    overlay.style.position = "fixed"
    overlay.style.top = "0"
    overlay.style.left = "0"
    overlay.style.width = "100%"
    overlay.style.height = "100%"
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    overlay.style.display = "flex"
    overlay.style.justifyContent = "center"
    overlay.style.alignItems = "center"
    overlay.style.zIndex = "1000"

    // Create details container
    const detailsContainer = document.createElement("div")
    detailsContainer.style.backgroundColor = "#fff"
    detailsContainer.style.borderRadius = "8px"
    detailsContainer.style.padding = "30px"
    detailsContainer.style.maxWidth = "600px"
    detailsContainer.style.width = "90%"
    detailsContainer.style.maxHeight = "80vh"
    detailsContainer.style.overflowY = "auto"
    detailsContainer.style.position = "relative"

    // Create close button
    const closeButton = document.createElement("button")
    closeButton.innerHTML = "&times;"
    closeButton.style.position = "absolute"
    closeButton.style.top = "10px"
    closeButton.style.right = "15px"
    closeButton.style.fontSize = "24px"
    closeButton.style.background = "none"
    closeButton.style.border = "none"
    closeButton.style.cursor = "pointer"
    closeButton.style.color = "#000"

    // Create product content
    const content = document.createElement("div")
    content.style.display = "flex"
    content.style.flexDirection = "column"
    content.style.gap = "20px"

    // Product image and info container
    const productContainer = document.createElement("div")
    productContainer.style.display = "flex"
    productContainer.style.gap = "20px"
    productContainer.style.flexWrap = "wrap"

    // Product image
    const productImage = document.createElement("img")
    productImage.src = product.image
    productImage.alt = product.name
    productImage.style.width = "200px"
    productImage.style.height = "auto"
    productImage.style.objectFit = "cover"
    productImage.style.borderRadius = "4px"

    // Product info
    const productInfo = document.createElement("div")
    productInfo.style.flex = "1"
    productInfo.style.minWidth = "250px"

    // Product title
    const productTitle = document.createElement("h2")
    productTitle.textContent = product.name
    productTitle.style.marginBottom = "10px"

    // Product category
    const productCategory = document.createElement("p")
    productCategory.textContent = product.category
    productCategory.style.color = "#666"
    productCategory.style.marginBottom = "10px"

    // Product rating
    const productRating = document.createElement("div")
    productRating.innerHTML = product.rating
    productRating.style.marginBottom = "15px"

    // Product price
    const productPrice = document.createElement("div")
    productPrice.style.fontSize = "24px"
    productPrice.style.fontWeight = "bold"
    productPrice.style.marginBottom = "20px"

    const currentPrice = document.createElement("span")
    currentPrice.textContent = `$${product.price}`

    const oldPrice = document.createElement("span")
    oldPrice.textContent = `$${product.oldPrice}`
    oldPrice.style.textDecoration = "line-through"
    oldPrice.style.color = "#999"
    oldPrice.style.marginLeft = "10px"
    oldPrice.style.fontSize = "18px"

    productPrice.appendChild(currentPrice)
    productPrice.appendChild(oldPrice)

    // Product description
    const productDescription = document.createElement("p")
    productDescription.textContent = product.description || "This premium quality product is designed for comfort and style. Made with high-quality materials that ensure durability and a perfect fit for any occasion."
    productDescription.style.lineHeight = "1.6"
    productDescription.style.marginBottom = "20px"

    // Add to cart button
    const addToCartBtn = document.createElement("button")
    addToCartBtn.textContent = "Add to Cart"
    addToCartBtn.className = "btn-add-to-cart"
    addToCartBtn.style.width = "100%"
    addToCartBtn.style.padding = "12px"
    addToCartBtn.style.marginTop = "10px"
    addToCartBtn.style.backgroundColor = "#000"
    addToCartBtn.style.color = "#fff"
    addToCartBtn.style.border = "1px solid #000"
    addToCartBtn.style.borderRadius = "4px"
    addToCartBtn.style.cursor = "pointer"

    // Assemble the product info
    productInfo.appendChild(productTitle)
    productInfo.appendChild(productCategory)
    productInfo.appendChild(productRating)
    productInfo.appendChild(productPrice)
    productInfo.appendChild(productDescription)
    productInfo.appendChild(addToCartBtn)

    // Assemble the product container
    productContainer.appendChild(productImage)
    productContainer.appendChild(productInfo)

    // Add everything to the content
    content.appendChild(productContainer)

    // Add content and close button to details container
    detailsContainer.appendChild(closeButton)
    detailsContainer.appendChild(content)

    // Add details container to overlay
    overlay.appendChild(detailsContainer)

    // Add overlay to body
    document.body.appendChild(overlay)

    // Close overlay when clicking close button
    closeButton.addEventListener("click", () => {
      overlay.remove()
    })

    // Close overlay when clicking outside the details container
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove()
      }
    })

    // Add to cart functionality for the button in the overlay
    addToCartBtn.addEventListener("click", () => {
      addToCart(product)
      overlay.remove()
    })
  }

  // Function to add product to cart
  function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("fascoCart")) || []
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex !== -1) {
      // Increase quantity if product already in cart
      cart[existingItemIndex].quantity += 1
    } else {
      // Add new product to cart with quantity 1
      cart.push({
        id: product.id || Date.now().toString(), // Use timestamp as ID if none provided
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color || "Default",
        size: product.size || "M",
        quantity: 1
      })
    }
    
    // Save updated cart
    localStorage.setItem("fascoCart", JSON.stringify(cart))
    updateCartCount()
    
    // Show confirmation message
    showCartConfirmation(`Added to cart: ${product.name}`)
    
    // Add a view cart button to the notification
    const viewCartBtn = document.createElement("a")
    viewCartBtn.href = "cart.html"
    viewCartBtn.textContent = "View Cart"
    viewCartBtn.style.color = "#fff"
    viewCartBtn.style.textDecoration = "underline"
    viewCartBtn.style.marginLeft = "10px"

    const notification = document.querySelector(".cart-confirmation-content")
    if (notification) {
      notification.appendChild(viewCartBtn)
    }
  }

  // Add buttons to "People Also Loved" product cards
  const relatedProducts = document.querySelectorAll(".related-products .product-card")
  
  relatedProducts.forEach((card, index) => {
    // Extract product information
    const productName = card.querySelector(".product-title").textContent
    const productCategory = card.querySelector(".product-category").textContent
    const productPrice = parseFloat(card.querySelector(".current-price").textContent.replace("$", ""))
    const productOldPrice = parseFloat(card.querySelector(".old-price").textContent.replace("$", ""))
    const productImage = card.querySelector(".product-image img").src
    const productRating = card.querySelector(".product-rating").innerHTML
    
    // Create product object
    const product = {
      id: `related-${index + 1}`,
      name: productName,
      category: productCategory,
      price: productPrice,
      oldPrice: productOldPrice,
      image: productImage,
      rating: productRating
    }
    
    // Create buttons container
    const buttonsContainer = document.createElement("div")
    buttonsContainer.className = "product-buttons"
    
    // Create Detail button
    const detailBtn = document.createElement("button")
    detailBtn.className = "btn-detail"
    detailBtn.textContent = "Detail"
    
    // Create Add to Cart button
    const addToCartBtn = document.createElement("button")
    addToCartBtn.className = "btn-add-to-cart"
    addToCartBtn.textContent = "Add to Cart"
    
    // Add buttons to container
    buttonsContainer.appendChild(detailBtn)
    buttonsContainer.appendChild(addToCartBtn)
    
    // Add container to product card
    card.querySelector(".product-info").appendChild(buttonsContainer)
    
    // Add event listeners
    detailBtn.addEventListener("click", () => {
      showProductDetails(product)
    })
    
    addToCartBtn.addEventListener("click", () => {
      addToCart(product)
    })
  })
})