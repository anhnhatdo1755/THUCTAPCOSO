document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:3000/api';
    let token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'signin.html';
        return;
    }
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

    // Format price to 2 decimal places with $ sign
    function formatPrice(price) {
        return "$" + Number.parseFloat(price).toFixed(2);
    }

    // Update copyright year
    const yearElements = document.querySelectorAll(".footer-bottom p");
    yearElements.forEach((element) => {
        const text = element.textContent;
        const updatedText = text.replace(/\d{4}/, new Date().getFullYear());
        element.textContent = updatedText;
    });

    // Load cart data and update checkout page
    async function loadCheckoutData() {
        const cart = await getCart();
        const productContainer = document.querySelector(".product-item");
        const subtotalElement = document.querySelector(".price-row:first-child span:last-child");
        const shippingElement = document.querySelector(".price-row:nth-child(2) span:last-child");
        const totalElement = document.querySelector(".price-row.total span:last-child");

        if (cart.length > 0) {
            // Calculate subtotal from cart
            let subtotal = 0;
            let itemCount = 0;

            cart.forEach((item) => {
                subtotal += item.price * item.quantity;
                itemCount += item.quantity;
            });

            // Update product display
            if (productContainer && cart[0]) {
                const item = cart[0];
                productContainer.innerHTML = `
                    <div class="product-image">
                        <img src="${getProductImageUrl(item.image) || "images/placeholder-dress.jpg"}" alt="${item.name}">
                        <span class="product-count">${item.quantity}</span>
                    </div>
                    <div class="product-details">
                        <h3>${item.name}</h3>
                        <p>${item.color}</p>
                    </div>
                    <div class="product-price">${formatPrice(item.price)}</div>
                `;

                // If there are more items, add a message
                if (cart.length > 1) {
                    const additionalItems = document.createElement("div");
                    additionalItems.className = "additional-items";
                    additionalItems.textContent = `+ ${cart.length - 1} more item(s)`;
                    productContainer.parentNode.insertBefore(additionalItems, productContainer.nextSibling);
                }
            }

            // Update price elements
            if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);

            // Calculate total
            const shipping = shippingElement ? Number.parseFloat(shippingElement.textContent.replace("$", "")) : 40.0;
            const total = subtotal + shipping;

            if (totalElement) totalElement.textContent = formatPrice(total);

            // Update cart count in header
            const cartCount = document.querySelector(".cart-count");
            if (cartCount) cartCount.textContent = itemCount.toString();
        } else {
            // Handle empty cart
            if (productContainer) {
                productContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
            }
            if (subtotalElement) subtotalElement.textContent = "$0.00";
            if (totalElement) totalElement.textContent = "$0.00";
        }
    }

    // Xử lý chọn thành phố và cập nhật phí shipping
    const citySelect = document.getElementById('city-select');
    const shippingElement = document.querySelector('.price-row:nth-child(2) span:last-child');
    if (citySelect && shippingElement) {
        // Khi load trang, nếu chưa chọn thành phố thì shipping = 0
        if (!citySelect.value) {
            shippingElement.textContent = formatPrice(0);
        }
        citySelect.addEventListener('change', function () {
            if (!this.value) {
                shippingElement.textContent = formatPrice(0);
            } else if (this.value === 'Hà Nội') {
                shippingElement.textContent = formatPrice(10);
            } else {
                shippingElement.textContent = formatPrice(20);
            }
            updateTotal();
        });
    }

    // Calculate total price
    const updateTotal = () => {
        const subtotalElement = document.querySelector(".price-row:first-child span:last-child");
        const shippingElement = document.querySelector(".price-row:nth-child(2) span:last-child");
        const totalElement = document.querySelector(".price-row.total span:last-child");

        if (subtotalElement && shippingElement && totalElement) {
            const subtotal = Number.parseFloat(subtotalElement.textContent.replace("$", ""));
            const shipping = Number.parseFloat(shippingElement.textContent.replace("$", ""));
            const total = subtotal + shipping;

            totalElement.textContent = formatPrice(total);
        }
    };

    // Sửa nút thanh toán để gửi đúng paymentMethod và validate phù hợp
    const payButton = document.querySelector('.btn-full');
    if (payButton) {
        payButton.addEventListener('click', async (e) => {
            e.preventDefault();
            let paymentMethod = 'cod';
            // Validate các trường bắt buộc
            const name = document.getElementById('name-input').value;
            const address = document.querySelector('input[placeholder="Địa chỉ"]').value;
            const phoneInput = document.getElementById('phone-input');
            const phone = phoneInput ? phoneInput.value.trim() : '';
            console.log('Phone value:', phone); // Debug log
            if (!name || !address || !citySelect.value || !phone) {
                alert('Vui lòng nhập đầy đủ thông tin giao hàng (tên, địa chỉ, số điện thoại và thành phố)');
                return;
            }
            // Validate số điện thoại
            if (!/^[0-9]{10}$/.test(phone)) {
                alert('Số điện thoại phải có 10 chữ số');
                return;
            }
            // Lấy thêm các trường contact
            const email = document.querySelector('input[type="email"]').value;
            // Lấy phí shipping hiện tại
            let shippingFee = 0;
            if (citySelect.value === 'Hà Nội') shippingFee = 10;
            else if (citySelect.value) shippingFee = 20;
            // Lấy tổng tiền hàng
            const subtotalElement = document.querySelector('.price-row:first-child span:last-child');
            let totalPrice = 0;
            if (subtotalElement) {
                totalPrice = Number(subtotalElement.textContent.replace(/[^\d.]/g, ''));
            }
            console.log('Order data:', { // Debug log
                name,
                phone,
                email,
                address,
                city: citySelect.value,
                shippingFee,
                totalPrice
            });
            // Gửi order
            try {
                const response = await fetch(`${API_URL}/checkout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        paymentMethod,
                        name,
                        phone,
                        email,
                        address,
                        city: citySelect.value,
                        shippingFee: Number(shippingFee),
                        totalPrice: Number(totalPrice)
                    })
                });
                if (!response.ok) throw new Error('Failed to create order');
                // Show success message
                alert('Đặt hàng thành công!');
                window.location.href = 'homepage.html';
            } catch (error) {
                alert('Có lỗi khi đặt hàng.');
            }
        });
    }

    // Initialize the checkout page
    loadCheckoutData();
});

function getProductImageUrl(image) {
    if (!image) return 'images/placeholder-dress.jpg';
    image = image.replace(/\\/g, '/').replace(/\\/g, '/');
    if (image.startsWith('http')) return image;
    if (image.startsWith('uploads/')) return 'http://localhost:3000/' + image;
    return 'http://localhost:3000/uploads/' + image;
}
  
  