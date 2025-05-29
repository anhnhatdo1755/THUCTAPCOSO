document.addEventListener("DOMContentLoaded", () => {
  console.log('homepage.js loaded');
  const API_URL = 'http://localhost:3000/api';

  // Get cart from API
  async function getCart() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user not logged in');
        return [];
      }
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
    try {
      const cart = await getCart();
      const cartCount = document.querySelector(".cart-count");
      if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  // Initialize cart count on page load
  updateCartCount();

  // Function to show cart confirmation message
  function showCartConfirmation(message) {
    // Remove any existing confirmation
    const existingConfirmation = document.querySelector(".cart-confirmation");
    if (existingConfirmation) {
      existingConfirmation.remove();
    }

    // Create confirmation element
    const confirmation = document.createElement("div");
    confirmation.className = "cart-confirmation";

    const content = document.createElement("div");
    content.className = "cart-confirmation-content";

    const messageElement = document.createElement("p");
    messageElement.textContent = message;

    const viewCartLink = document.createElement("a");
    viewCartLink.href = "cart.html";
    viewCartLink.className = "view-cart-link";
    viewCartLink.textContent = "View Cart";

    content.appendChild(messageElement);
    content.appendChild(viewCartLink);
    confirmation.appendChild(content);

    // Add to body
    document.body.appendChild(confirmation);

    // Remove after 3 seconds
    setTimeout(() => {
      confirmation.style.opacity = "0";
      confirmation.style.transform = "translateX(100%)";
      confirmation.style.transition = "all 0.3s ease-out";

      setTimeout(() => {
        confirmation.remove();
      }, 300);
    }, 3000);
  }

  // Function to show product details overlay
  function showProductDetails(product) {
    // Create overlay container
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "1000";

    // Create details container
    const detailsContainer = document.createElement("div");
    detailsContainer.style.backgroundColor = "#fff";
    detailsContainer.style.borderRadius = "8px";
    detailsContainer.style.padding = "30px";
    detailsContainer.style.maxWidth = "600px";
    detailsContainer.style.width = "90%";
    detailsContainer.style.maxHeight = "80vh";
    detailsContainer.style.overflowY = "auto";
    detailsContainer.style.position = "relative";

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.fontSize = "24px";
    closeButton.style.background = "none";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#000";

    // Create product content
    const content = document.createElement("div");
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.gap = "20px";

    // Product image and info container
    const productContainer = document.createElement("div");
    productContainer.style.display = "flex";
    productContainer.style.gap = "20px";
    productContainer.style.flexWrap = "wrap";

    // Product image
    const productImage = document.createElement("img");
    productImage.src = product.image;
    productImage.alt = product.name;
    productImage.style.width = "200px";
    productImage.style.height = "auto";
    productImage.style.objectFit = "cover";
    productImage.style.borderRadius = "4px";

    // Product info
    const productInfo = document.createElement("div");
    productInfo.style.flex = "1";
    productInfo.style.minWidth = "250px";

    // Product title
    const productTitle = document.createElement("h2");
    productTitle.textContent = product.name;
    productTitle.style.marginBottom = "10px";

    // Product category
    const productCategory = document.createElement("p");
    productCategory.textContent = product.category;
    productCategory.style.color = "#666";
    productCategory.style.marginBottom = "10px";

    // Product rating
    const productRating = document.createElement("div");
    productRating.innerHTML = product.rating;
    productRating.style.marginBottom = "15px";

    // Product price
    const productPrice = document.createElement("div");
    productPrice.style.fontSize = "24px";
    productPrice.style.fontWeight = "bold";
    productPrice.style.marginBottom = "20px";

    const currentPrice = document.createElement("span");
    currentPrice.textContent = `$${product.price}`;

    const oldPrice = document.createElement("span");
    oldPrice.textContent = `$${product.oldPrice}`;
    oldPrice.style.textDecoration = "line-through";
    oldPrice.style.color = "#999";
    oldPrice.style.marginLeft = "10px";
    oldPrice.style.fontSize = "18px";

    productPrice.appendChild(currentPrice);
    productPrice.appendChild(oldPrice);

    // Product description
    const productDescription = document.createElement("p");
    productDescription.textContent = product.description || "This premium quality product is designed for comfort and style. Made with high-quality materials that ensure durability and a perfect fit for any occasion.";
    productDescription.style.lineHeight = "1.6";
    productDescription.style.marginBottom = "20px";

    // Add to cart button
    const addToCartBtn = document.createElement("button");
    addToCartBtn.textContent = "Add to Cart";
    addToCartBtn.className = "btn-add-to-cart";
    addToCartBtn.style.width = "100%";
    addToCartBtn.style.padding = "12px";
    addToCartBtn.style.marginTop = "10px";

    // Assemble the product info
    productInfo.appendChild(productTitle);
    productInfo.appendChild(productCategory);
    productInfo.appendChild(productRating);
    productInfo.appendChild(productPrice);
    productInfo.appendChild(productDescription);
    productInfo.appendChild(addToCartBtn);

    // Assemble the product container
    productContainer.appendChild(productImage);
    productContainer.appendChild(productInfo);

    // Add everything to the content
    content.appendChild(productContainer);

    // Add content and close button to details container
    detailsContainer.appendChild(closeButton);
    detailsContainer.appendChild(content);

    // Add details container to overlay
    overlay.appendChild(detailsContainer);

    // Add overlay to body
    document.body.appendChild(overlay);

    // Close overlay when clicking close button
    closeButton.addEventListener("click", () => {
      overlay.remove();
    });

    // Close overlay when clicking outside the details container
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // Add to cart functionality for the button in the overlay
    addToCartBtn.addEventListener("click", () => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color,
        size: product.size,
        brand: product.brand,
        collection: product.collection,
        description: product.description
      });
      overlay.remove();
    });
  }

  // Function to add product to cart
  async function addToCart(product) {
    try {
      console.log('=== addToCart Debug ===');
      console.log('Product:', product);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        return;
      }

      const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          Productsid: product.id,
          quantity: 1
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }

      // Update cart count after successful add
      await updateCartCount();
      
      // Show confirmation message
      showCartConfirmation(`Added to cart: ${product.name}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Failed to add to cart. Please try again.');
    }
  }

  // Function to redirect to product detail page
  function goToProductDetail(product) {
    // Save selected product to localStorage
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    // Redirect to product detail page
    window.location.href = "sanpham.html";
  }

  // --- COLLECTIONS LOGIC ---
  function getProductImageUrl(image) {
    if (!image) return 'images/placeholder-dress.jpg';
    image = image.replace(/\\/g, '/').replace(/\\/g, '/');
    if (image.startsWith('http')) return image;
    if (image.startsWith('uploads/')) return 'http://localhost:3000/' + image;
    return 'http://localhost:3000/uploads/' + image;
  }

  // Function to render collection products
  async function renderCollectionsProducts(collection, page = 1) {
    try {
      console.log('Gọi API collection:', collection, page);
      const response = await fetch(`${API_URL}/products/collection?collection=${collection}&page=${page}&limit=4`);
      const data = await response.json();
      console.log('Kết quả API:', data);
      const productsGrid = document.querySelector('.collections-products-grid');
      const paginationContainer = document.querySelector('.collections-pagination');
      if (!productsGrid) return;
      // Clear existing products
      productsGrid.innerHTML = '';
      if (data.products && data.products.length > 0) {
        data.products.forEach(product => {
          const productCard = document.createElement('div');
          productCard.className = 'product-card';
          productCard.innerHTML = `
            <div class="product-image">
              <img src="${getProductImageUrl(product.image)}" alt="${product.name}">
            </div>
            <div class="product-info">
              <h3 class="product-title">${product.name}</h3>
              <div class="product-price"><b>$${product.price}</b></div>
              <div class="product-buttons">
                <button class="btn-detail">Detail</button>
                <button class="btn-add-to-cart">Add to Cart</button>
              </div>
            </div>
          `;
          // Nút Detail
          const detailBtn = productCard.querySelector('.btn-detail');
          detailBtn.addEventListener('click', () => {
            localStorage.setItem("selectedProduct", JSON.stringify(product));
            window.location.href = "sanpham.html";
          });
          // Nút Add to Cart
          const addToCartBtn = productCard.querySelector('.btn-add-to-cart');
          console.log('Found add to cart button:', addToCartBtn);
          addToCartBtn.addEventListener('click', async (e) => {
            console.log('Add to cart button clicked');
            console.log('Event target:', e.target);
            console.log('Product data:', product);
            await addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              color: product.color,
              size: product.size,
              brand: product.brand,
              collection: product.collection,
              description: product.description
            });
          });
          productsGrid.appendChild(productCard);
        });
        // Render pagination if needed
        if (data.total > 4) {
          const totalPages = Math.ceil(data.total / 4);
          renderPagination(paginationContainer, page, totalPages, collection);
        } else {
          paginationContainer.innerHTML = '';
        }
      } else {
        productsGrid.innerHTML = '<p class="no-products">No products found in this collection.</p>';
        paginationContainer.innerHTML = '';
      }
    } catch (error) {
      console.error('Error fetching collection products:', error);
      const productsGrid = document.querySelector('.collections-products-grid');
      if (productsGrid) {
        productsGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
      }
    }
  }

  // Function to render pagination
  function renderPagination(container, currentPage, totalPages, collection) {
    container.innerHTML = '';
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    // Prev button
    if (currentPage > 1) {
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Prev';
      prevButton.className = 'page-btn';
      prevButton.addEventListener('click', () => renderCollectionsProducts(collection, currentPage - 1));
      pagination.appendChild(prevButton);
    }

    // Hiển thị tối đa 3 số trang liền nhau
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);
    for (let i = start; i <= end; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.className = 'page-btn';
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => renderCollectionsProducts(collection, i));
      pagination.appendChild(pageButton);
    }

    // Next button
    if (currentPage < totalPages) {
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.className = 'page-btn';
      nextButton.addEventListener('click', () => renderCollectionsProducts(collection, currentPage + 1));
      pagination.appendChild(nextButton);
    }

    container.appendChild(pagination);
  }

  // Function to generate rating stars
  function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }
    return stars;
  }

  // Gắn sự kiện cho các nút collection
  const collectionButtons = document.querySelectorAll('.collection-btn');
  collectionButtons.forEach(button => {
    button.addEventListener('click', () => {
      console.log('Click button:', button.dataset.collection); // debug
      // Remove active class from all buttons
      collectionButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');
      // Get collection name and render products
      const collection = button.dataset.collection;
      renderCollectionsProducts(collection);
    });
  });
  // Load initial collection (Spring)
  renderCollectionsProducts('Spring');
});