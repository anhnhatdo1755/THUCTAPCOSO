document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = 'http://localhost:3000/api';
    let token = localStorage.getItem('token');
    let user = JSON.parse(localStorage.getItem('user'));
    let currentPage = 1;
    const PRODUCTS_PER_PAGE = 9;

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

    // Fetch products from API and render
    async function fetchAndRenderProducts(page = 1) {
        try {
            // Lấy tổng số sản phẩm để tạo phân trang
            const response = await fetch(`${API_URL}/products?page=${page}&limit=${PRODUCTS_PER_PAGE}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            const products = await response.json();

            // Nếu API trả về tổng số sản phẩm, lấy từ headers hoặc response
            let totalProducts = 0;
            if (response.headers.get('X-Total-Count')) {
                totalProducts = parseInt(response.headers.get('X-Total-Count'));
            } else if (Array.isArray(products) && products.length === PRODUCTS_PER_PAGE) {
                // Nếu không có header, có thể cần API trả về tổng số sản phẩm
                // Ở đây tạm thời không xử lý, chỉ tạo 5 trang mẫu
                totalProducts = 45;
            } else {
                totalProducts = products.length;
            }

            const productListings = document.querySelector('.product-listings1');
            productListings.innerHTML = '';

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card1';
                card.setAttribute('data-id', product.id);
                card.innerHTML = `
                    <div class="product-image1">
                        <img src="${product.image || 'images/placeholder-dress.jpg'}" alt="${product.name}">
                    </div>
                    <div class="product-info1">
                        <h3>${product.name}</h3>
                        <div class="product-price1">$${product.price}</div>
                        <button class="Detail">Detail</button>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                `;
                productListings.appendChild(card);
            });

            // Gắn lại event cho nút Detail, Add to Cart
            attachProductCardEvents();

            // Tạo lại nút phân trang
            renderPagination(totalProducts, page);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Attach event listeners for product cards
    function attachProductCardEvents() {
        const productCards = document.querySelectorAll(".product-card1");
        productCards.forEach((card) => {
            const detailBtn = card.querySelector(".Detail");
            const addToCartBtn = card.querySelector(".add-to-cart");
            const productId = card.getAttribute("data-id");
            const productName = card.querySelector(".product-info1 h3").textContent;
            const productPrice = Number.parseFloat(card.querySelector(".product-price1").textContent.replace("$", ""));
            const productImage = card.querySelector(".product-image1 img").getAttribute("src");
            // Mặc định màu (nếu có thể lấy từ API thì lấy, còn không thì để Black)
            const productColor = "Black";

            detailBtn.addEventListener("click", () => {
                const productData = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    color: productColor,
                };
                localStorage.setItem("selectedProduct", JSON.stringify(productData));
                window.location.href = "sanpham.html";
            });

            addToCartBtn.addEventListener("click", async () => {
                try {
                    const response = await fetch(`${API_URL}/cart`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            Productsid: productId,
                            quantity: 1
                        })
                    });
                    if (!response.ok) throw new Error('Failed to add to cart');
                    updateCartCount();
                    // Show confirmation
                    const confirmationMessage = document.createElement("div");
                    confirmationMessage.className = "cart-confirmation";
                    confirmationMessage.innerHTML = `
                        <div class="cart-confirmation-content">
                            <p>${productName} added to cart!</p>
                            <a href="cart.html" class="view-cart">View Cart</a>
                        </div>
                    `;
                    document.body.appendChild(confirmationMessage);
                    setTimeout(() => {
                        confirmationMessage.remove();
                    }, 3000);
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    alert('Failed to add item to cart. Please try again.');
                }
            });
        });
    }

    // Tạo lại nút phân trang
    function renderPagination(totalProducts, currentPage) {
        let totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
        if (!totalPages || totalPages < 1) totalPages = 1;
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
            btn.textContent = i;
            btn.setAttribute('data-page', i);
            if (i === currentPage) btn.classList.add('active');
            btn.addEventListener('click', async () => {
                document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                await fetchAndRenderProducts(i);
            });
            paginationContainer.appendChild(btn);
        }
    }

    // Cart Functionality (giữ nguyên)
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

    async function updateCartCount() {
        const cart = await getCart();
        const cartCount = document.querySelector(".cart-count");
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    // Gọi fetchAndRenderProducts khi load trang
    await fetchAndRenderProducts(currentPage);

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
  })
  
  