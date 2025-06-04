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
      mainImage.src = getProductImageUrl(selectedProduct.image)
    }

    // Lấy sản phẩm liên quan
    let currentPage = 1;
    const limit = 3;
    function renderRelated(page = 1) {
      fetch(`${API_URL}/products/related/${selectedProduct.id}?page=${page}&limit=${limit}`)
        .then(res => res.json())
        .then(data => {
          const { products, total } = data;
          const container = document.querySelector('.related-products-container');
          container.innerHTML = '';
          products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
              <div class="product-image">
                <img src="${getProductImageUrl(product.image)}" alt="${product.name}">
              </div>
              <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                  <span class="current-price">$${product.price}</span>
                </div>
              </div>
            `;
            // Thêm nút chi tiết và add to cart
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'product-buttons';
            const detailBtn = document.createElement('button');
            detailBtn.className = 'btn-detail';
            detailBtn.textContent = 'Detail';
            detailBtn.onclick = () => {
  localStorage.setItem("selectedProduct", JSON.stringify(product));
  window.location.href = "sanpham.html";
};
            const addToCartBtn = document.createElement('button');
            addToCartBtn.className = 'btn-add-to-cart';
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.onclick = () => addToCart(product);
            buttonsContainer.appendChild(detailBtn);
            buttonsContainer.appendChild(addToCartBtn);
            card.querySelector('.product-info').appendChild(buttonsContainer);
            container.appendChild(card);
          });
          // Trước khi thêm pagination mới, xóa pagination cũ nếu có
          const oldPagination = container.parentElement.querySelector('.related-pagination');
          if (oldPagination) oldPagination.remove();
          // Phân trang kiểu slider dots và nút tròn
          const pagination = document.createElement('div');
          pagination.className = 'related-pagination';
          pagination.style.display = 'flex';
          pagination.style.justifyContent = 'center';
          pagination.style.alignItems = 'center';
          pagination.style.gap = '20px';
          pagination.style.marginTop = '32px';
          pagination.style.width = '100%';
          pagination.style.textAlign = 'center';
          const totalPages = Math.ceil(total / limit);
          // Nút tròn prev
          const prevBtn = document.createElement('button');
          prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
          prevBtn.className = 'circle-arrow';
          prevBtn.disabled = page === 1;
          prevBtn.onclick = () => { if (page > 1) { currentPage--; renderRelated(currentPage); } };
          // Dots
          const dots = document.createElement('div');
          dots.style.display = 'flex';
          dots.style.gap = '8px';
          for (let i = 1; i <= totalPages; i++) {
            const dot = document.createElement('span');
            dot.className = 'slider-dot' + (i === page ? ' active' : '');
            dot.onclick = () => { currentPage = i; renderRelated(currentPage); };
            dots.appendChild(dot);
          }
          // Nút tròn next
          const nextBtn = document.createElement('button');
          nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
          nextBtn.className = 'circle-arrow';
          nextBtn.disabled = page === totalPages || totalPages === 0;
          nextBtn.onclick = () => { if (page < totalPages) { currentPage++; renderRelated(currentPage); } };
          pagination.appendChild(prevBtn);
          pagination.appendChild(dots);
          pagination.appendChild(nextBtn);
          container.parentElement.appendChild(pagination);
        });
    }
    renderRelated(currentPage);

    // Khi load trang, cập nhật stock tổng
    const stockSpan = document.querySelector('.product-stock span strong');
    if (stockSpan && selectedProduct.stock !== undefined) {
      stockSpan.textContent = selectedProduct.stock + ' item(s)';
    }

    // Khi load trang, tự động chọn size đúng với size của sản phẩm và cập nhật label
    const sizeOptions = document.querySelectorAll(".size-option");
    if (selectedProduct.size) {
      sizeOptions.forEach(option => {
        option.classList.remove("active");
        if (option.textContent.trim().toLowerCase() === selectedProduct.size.toLowerCase()) {
          option.classList.add("active");
          // Cập nhật label
          const sizeLabel = document.querySelector('.option-group label');
          if (sizeLabel) sizeLabel.textContent = `Size: ${selectedProduct.size}`;
        }
      });
    }

    // Khi load trang, chỉ hiển thị nút màu đúng với selectedProduct.color
    const colorOptions = document.querySelectorAll(".color-option");
    if (selectedProduct.color) {
      colorOptions.forEach(option => {
        if (!option.classList.contains(selectedProduct.color.toLowerCase())) {
          option.style.display = 'none';
        } else {
          option.style.display = '';
        }
      });
    }

    // Nếu chỉ có 1 nút màu được hiển thị, ẩn luôn label 'Color: ...'
    const colorLabel = document.querySelectorAll('.option-group label')[1];
    if (selectedProduct.color && colorLabel) {
      let visibleColorCount = 0;
      colorOptions.forEach(option => {
        if (option.style.display !== 'none') visibleColorCount++;
      });
      if (visibleColorCount === 1) {
        colorLabel.style.display = 'none';
      }
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

      .circle-arrow {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid #eee;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        cursor: pointer;
        transition: background 0.2s, border 0.2s;
        outline: none;
      }
      .circle-arrow:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .slider-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ddd;
        display: inline-block;
        margin: 0 3px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .slider-dot.active {
        background: #111;
      }

      .related-products-container > div:last-child {
        margin-left: auto;
        margin-right: auto;
        text-align: center;
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
  async function updateCartCount() {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to get cart');
      const data = await response.json();
      const cart = data.products || [];
      const cartCount = document.querySelector(".cart-count")
      if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
        cartCount.textContent = totalItems
        console.log("Cart count updated to:", totalItems)
      } else {
        console.log("Cart count element not found")
      }
    } catch (error) {
      console.error('Error updating cart count:', error)
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
      mainImage.src = getProductImageUrl(thumbnailImg.src)
    })
  })

  // Size selection
  const sizeOptions = document.querySelectorAll(".size-option")

  sizeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      sizeOptions.forEach(o => o.classList.remove("active"));
      this.classList.add("active");
      // Cập nhật label
      const sizeLabel = document.querySelector('.option-group label');
      if (sizeLabel) sizeLabel.textContent = `Size: ${this.textContent.trim()}`;
      updateStockDisplay(selectedProduct.stock);
    })
  })

  // Color selection
  const colorOptions = document.querySelectorAll(".color-option")

  colorOptions.forEach((option) => {
    option.addEventListener("click", function () {
      colorOptions.forEach(o => o.classList.remove("active"));
      this.classList.add("active");
      // Cập nhật label
      const colorLabel = document.querySelectorAll('.option-group label')[1];
      let colorName = "";
      if (this.classList.contains("blue")) colorName = "Blue";
      else if (this.classList.contains("black")) colorName = "Black";
      else if (this.classList.contains("pink")) colorName = "Pink";
      if (colorLabel) colorLabel.textContent = `Color: ${colorName}`;
      updateStockDisplay(selectedProduct.stock);
    })
  })

  // Quantity selector
  const minusBtn = document.querySelector(".quantity-btn.minus")
  const plusBtn = document.querySelector(".quantity-btn.plus")
  const quantityInput = document.querySelector(".quantity-input")

  if (minusBtn && plusBtn && quantityInput) {
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
  }

  // Add to cart button
  const addToCartBtn = document.querySelector(".btn-add-to-cart")

  addToCartBtn.addEventListener("click", async () => {
    let token = localStorage.getItem('token');
    if (!token) {
        alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
        window.location.href = 'signin.html';
        return;
    }
    try {
      const productId = selectedProduct.id
      const quantity = Number.parseInt(quantityInput.value)

      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Productsid: productId,
          quantity: quantity
        })
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      // Update cart count
      updateCartCount()

      // Show confirmation message
      showCartConfirmation(`${selectedProduct.name} added to cart!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
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
    productImage.src = getProductImageUrl(product.image)
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
      // Add new product to cart với đầy đủ trường
      cart.push({
        id: product.id || Date.now().toString(),
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color || 'Không xác định',
        size: product.size || 'Không xác định',
        brand: product.brand || 'Không xác định',
        collection: product.collection,
        description: product.description,
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

  function getProductImageUrl(image) {
    if (!image) return 'images/placeholder-dress.jpg';
    return image; // Backend đã trả về URL đầy đủ
  }

  // Sau khi chọn size hoặc màu, cập nhật lại số lượng còn trong kho
  function updateStockDisplay(stock) {
    const stockSpan = document.querySelector('.product-stock span strong');
    if (stockSpan) {
      stockSpan.textContent = stock + ' item(s)';
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
})