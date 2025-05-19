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
                        <img src="${item.image || "images/placeholder-dress.jpg"}" alt="${item.name}">
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
                shippingElement.textContent = formatPrice(20000);
            } else {
                shippingElement.textContent = formatPrice(100000);
            }
            updateTotal();
        });
    }

    // Xử lý chọn phương thức thanh toán
    const paymentRadios = document.getElementsByName('payment-method');
    const cardFields = document.querySelector('.payment-card-fields');
    if (paymentRadios && cardFields) {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function () {
                if (this.value === 'cod') {
                    cardFields.style.display = 'none';
                } else {
                    cardFields.style.display = '';
                }
            });
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
            let paymentMethod = 'card';
            if (document.querySelector('input[name="payment-method"]:checked').value === 'cod') {
                paymentMethod = 'cod';
            }
            // Validate các trường bắt buộc
            const name = document.getElementById('name-input').value;
            const address = document.querySelector('input[placeholder="Địa chỉ"]').value;
            if (!name || !address || !citySelect.value) {
                alert('Vui lòng nhập đầy đủ thông tin giao hàng');
                return;
            }
            if (paymentMethod === 'card') {
                const cardNumber = document.querySelector('input[placeholder="Card Number"]').value;
                const expirationDate = document.querySelector('input[placeholder="Expiration Date"]').value;
                const securityCode = document.querySelector('input[placeholder="Security Code"]').value;
                const cardHolder = document.querySelector('input[placeholder="Card Holder Name"]').value;
                if (!cardNumber || !expirationDate || !securityCode || !cardHolder) {
                    alert('Vui lòng nhập đầy đủ thông tin thẻ');
                    return;
                }
                // Simple validation for card number (16 digits)
                if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
                    alert("Please enter a valid 16-digit card number");
                    return;
                }

                // Simple validation for expiration date (MM/YY)
                if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
                    alert("Please enter expiration date in MM/YY format");
                    return;
                }

                // Simple validation for security code (3 digits)
                if (!/^\d{3}$/.test(securityCode)) {
                    alert("Please enter a valid 3-digit security code");
                    return;
                }
            }
            // Lấy thêm các trường contact
            const email = document.querySelector('input[type="email"]').value;
            const phone = document.getElementById('phone-input').value;
            // Lấy phí shipping hiện tại
            let shippingFee = 0;
            if (citySelect.value === 'Hà Nội') shippingFee = 20000;
            else if (citySelect.value) shippingFee = 100000;
            // Lấy tổng tiền hàng
            const subtotalElement = document.querySelector('.price-row:first-child span:last-child');
            let totalPrice = 0;
            if (subtotalElement) {
                totalPrice = Number(subtotalElement.textContent.replace(/[^\d]/g, ''));
            }
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
                        shippingFee,
                        totalPrice
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
  
  