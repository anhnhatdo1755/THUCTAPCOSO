document.addEventListener("DOMContentLoaded", () => {
  // Get cart from localStorage or initialize empty array
  function getCart() {
    return JSON.parse(localStorage.getItem("fascoCart")) || [];
  }

  // Save cart to localStorage
  function saveCart(cart) {
    localStorage.setItem("fascoCart", JSON.stringify(cart));
    updateCartCount();
  }

  // Update cart count in header
  function updateCartCount() {
    const cart = getCart();
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
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
      addToCart(product);
      overlay.remove();
    });
  }

  // Function to add product to cart
  function addToCart(product) {
    const cart = getCart();
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex !== -1) {
      // Increase quantity if product already in cart
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart with quantity 1
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color || "Default",
        quantity: 1
      });
    }
    
    // Save updated cart
    saveCart(cart);
    
    // Show confirmation message
    showCartConfirmation(`Added to cart: ${product.name}`);
  }

  // Function to redirect to product detail page
  function goToProductDetail(product) {
    // Save selected product to localStorage
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    
    // Redirect to product detail page
    window.location.href = "sanpham.html";
  }

  // Get all product cards in the New Arrivals section
  const productCards = document.querySelectorAll(".new-arrivals .product-card");
  
  // Add event listeners to each product card
  productCards.forEach(card => {
    const productId = card.getAttribute("data-product-id");
    const productName = card.querySelector(".product-title").textContent;
    const productCategory = card.querySelector(".product-category").textContent;
    const productPrice = parseFloat(card.querySelector(".current-price").textContent.replace("$", ""));
    const productOldPrice = parseFloat(card.querySelector(".old-price").textContent.replace("$", ""));
    const productImage = card.querySelector(".product-image img").src;
    const productRating = card.querySelector(".product-rating").innerHTML;
    
    // Create product object
    const product = {
      id: productId,
      name: productName,
      category: productCategory,
      price: productPrice,
      oldPrice: productOldPrice,
      image: productImage,
      rating: productRating
    };
    
    // Add event listener to Detail button
    const detailBtn = card.querySelector(".btn-detail");
    detailBtn.addEventListener("click", () => {
      showProductDetails(product);
    });
    
    // Add event listener to Add to Cart button
    const addToCartBtn = card.querySelector(".btn-add-to-cart");
    addToCartBtn.addEventListener("click", () => {
      addToCart(product);
    });
  });
});