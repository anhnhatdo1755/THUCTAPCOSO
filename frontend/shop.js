document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = 'http://localhost:3000/api';
    let token = localStorage.getItem('token');
    let user = JSON.parse(localStorage.getItem('user'));
    let currentPage = 1;
    const PRODUCTS_PER_PAGE = 9;

    // State lưu filter
    let currentFilters = {
      size: '',
      color: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      collection: '',
      category: '',
      name: '' // Thêm trường name để filter theo tên
    };

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
            // Tạo query string filter
            let filterQuery = '';
            if (currentFilters.size) filterQuery += `&size=${encodeURIComponent(currentFilters.size)}`;
            if (currentFilters.color) filterQuery += `&color=${encodeURIComponent(currentFilters.color)}`;
            if (currentFilters.minPrice) filterQuery += `&minPrice=${currentFilters.minPrice}`;
            if (currentFilters.maxPrice) filterQuery += `&maxPrice=${currentFilters.maxPrice}`;
            if (currentFilters.brand) filterQuery += `&brand=${encodeURIComponent(currentFilters.brand)}`;
            if (currentFilters.collection) filterQuery += `&collection=${encodeURIComponent(currentFilters.collection)}`;
            if (currentFilters.category) filterQuery += `&category=${encodeURIComponent(currentFilters.category)}`;
            if (currentFilters.name) filterQuery += `&name=${encodeURIComponent(currentFilters.name)}`;

            // Lấy tổng số sản phẩm để tạo phân trang
            const response = await fetch(`${API_URL}/products?page=${page}&limit=${PRODUCTS_PER_PAGE}${filterQuery}`);
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
                        <img src="${getProductImageUrl(product.image)}" alt="${product.name}">
                    </div>
                    <div class="product-info1">
                        <h3>${product.name}</h3>
                        <div class="product-price1">$${product.price}</div>
                        <div class="product-buttons">
                            <button class="btn-detail">Detail</button>
                            <button class="btn-add-to-cart">Add to Cart</button>
                        </div>
                    </div>
                `;
                // Gắn event cho nút Detail
                const detailBtn = card.querySelector(".btn-detail");
                detailBtn.addEventListener("click", () => {
                    const productData = {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        color: product.color || '',
                        size: product.size || '',
                        brand: product.brand || '',
                        collection: product.collection || '',
                        description: product.description || '',
                        stock: product.stock || 0,
                        quantity: 1
                    };
                    localStorage.setItem("selectedProduct", JSON.stringify(productData));
                    window.location.href = "sanpham.html";
                });
                // Gắn event cho nút Add to Cart
                const addToCartBtn = card.querySelector(".btn-add-to-cart");
                addToCartBtn.addEventListener("click", async () => {
                    let token = localStorage.getItem('token');
                    if (!token) {
                        alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
                        window.location.href = 'signin.html';
                        return;
                    }
                    try {
                        const response = await fetch(`${API_URL}/cart`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                Productsid: product.id,
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
                                <p>${product.name} added to cart!</p>
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
                productListings.appendChild(card);
            });

            // Tạo lại nút phân trang
            renderPagination(totalProducts, page);
        } catch (error) {
            console.error('Error loading products:', error);
        }
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

    // Cart Functionality 
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
        const isActive = button.classList.contains("active");
        sizeButtons.forEach((btn) => btn.classList.remove("active"))
        if (isActive) {
          currentFilters.size = '';
        } else {
          button.classList.add("active")
          currentFilters.size = button.textContent.trim();
        }
        fetchAndRenderProducts(1);
      })
    })
  
    // Color Filter Functionality
    const colorButtons = document.querySelectorAll(".color-btn");
    colorButtons.forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.toggle("active");
        // Lấy tất cả các màu đang được chọn
        const selectedColors = Array.from(colorButtons)
          .filter(btn => btn.classList.contains("active"))
          .map(btn => btn.style.backgroundColor);
        currentFilters.color = selectedColors.join(',');
        fetchAndRenderProducts(1);
      });
    });
  
    // Price Range Input (min-max)
    const minPriceInput = document.querySelector('.min-price-input');
    const maxPriceInput = document.querySelector('.max-price-input');
    minPriceInput.addEventListener('input', () => {
      currentFilters.minPrice = minPriceInput.value;
      fetchAndRenderProducts(1);
    });
    maxPriceInput.addEventListener('input', () => {
      currentFilters.maxPrice = maxPriceInput.value;
      fetchAndRenderProducts(1);
    });
  
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

    // Brand Filter Functionality
    const brandCheckboxes = document.querySelectorAll('.brand-options input[type="checkbox"]');
    brandCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        // Lấy tất cả các brand đang được chọn
        const selectedBrands = Array.from(brandCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        currentFilters.brand = selectedBrands.join(',');
        fetchAndRenderProducts(1);
      });
    });

    // Collection Filter Functionality
    const collectionCheckboxes = document.querySelectorAll('.collection-options input[type="checkbox"]');
    collectionCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        // Lấy tất cả các collection đang được chọn
        const selectedCollections = Array.from(collectionCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        currentFilters.collection = selectedCollections.join(',');
        fetchAndRenderProducts(1);
      });
    });

    // --- CATEGORY FILTER (RADIO) ---
    async function renderCategoryRadios() {
      const container = document.querySelector('.category-options-radio');
      if (!container) return;
      try {
        const res = await fetch('http://localhost:3000/api/categories');
        const categories = await res.json();
        container.innerHTML = `<label><input type="radio" name="category-radio" value="" checked> Tất cả</label><br>` +
          categories.map(cat =>
            `<label><input type="radio" name="category-radio" value="${cat.id}"> ${cat.categoryName}</label><br>`
          ).join('');
        // Gắn event
        const radios = container.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
          radio.addEventListener('change', () => {
            currentFilters.category = radio.value;
            fetchAndRenderProducts(1);
          });
        });
      } catch (err) {
        container.innerHTML = '<p>Không thể tải danh mục!</p>';
      }
    }
    // Gọi khi load trang
    renderCategoryRadios();

    // --- SEARCH BY NAME ---
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          currentFilters.name = this.value.trim();
          fetchAndRenderProducts(1);
        }, 400);
      });
    }

    function getProductImageUrl(image) {
        if (!image) return 'images/placeholder-dress.jpg';
        image = image.replace(/\\/g, '/').replace(/\\/g, '/');
        if (image.startsWith('http')) return image;
        if (image.startsWith('uploads/')) return 'http://localhost:3000/' + image;
        return 'http://localhost:3000/uploads/' + image;
    }
  })

