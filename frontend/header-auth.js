document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:3000/api';
    let token = localStorage.getItem('token');
    let user = JSON.parse(localStorage.getItem('user'));

    // Get navigation elements
    const navLinks = document.querySelector(".nav-links");
    const signUpButton = document.querySelector(".sign-up");

    if (token && user) {
        // User is logged in, update the navigation

        // Find the Sign In link and remove it
        const signInLink = navLinks.querySelector('a[href="signin.html"]');
        if (signInLink) {
            const signInListItem = signInLink.parentElement;
            signInListItem.remove();
        }

        // Remove the Sign Up button
        if (signUpButton) {
            signUpButton.innerHTML = "";

            // Create user icon similar to cart page
            const iconsGroup = document.createElement("div");
            iconsGroup.className = "icons-group";
            iconsGroup.style.display = "flex";
            iconsGroup.style.alignItems = "center";
            iconsGroup.style.gap = "15px";

            // Add user icon
            const userLink = document.createElement("a");
            userLink.href = user.role === "admin" ? "admin.html" : "#";
            userLink.className = "icon-link";
            userLink.style.position = "relative";
            userLink.style.color = "#333";
            userLink.style.fontSize = "18px";

            const userIcon = document.createElement("i");
            userIcon.className = "fas fa-user";

            userLink.appendChild(userIcon);
            iconsGroup.appendChild(userLink);

            // Add logout icon
            const logoutLink = document.createElement("a");
            logoutLink.href = "#";
            logoutLink.className = "icon-link logout-icon";
            logoutLink.style.position = "relative";
            logoutLink.style.color = "#333";
            logoutLink.style.fontSize = "18px";
            logoutLink.title = "Logout";

            const logoutIcon = document.createElement("i");
            logoutIcon.className = "fas fa-sign-out-alt";

            logoutLink.appendChild(logoutIcon);
            iconsGroup.appendChild(logoutLink);

            // Add logout functionality
            logoutLink.addEventListener("click", async (e) => {
                e.preventDefault();
                try {
                    // Call logout API
                    const response = await fetch(`${API_URL}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) throw new Error('Failed to logout');

                    // Clear local storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');

                    // Reload page
                    window.location.reload();
                } catch (error) {
                    console.error('Error logging out:', error);
                    alert('Failed to logout. Please try again.');
                }
            });

            // Add cart icon if not already present and user is not admin
            if (!document.querySelector(".cart-icon") && user.role !== 'admin') {
                const cartLink = document.createElement("a");
                cartLink.href = "cart.html";
                cartLink.className = "icon-link cart-icon";
                cartLink.style.position = "relative";
                cartLink.style.color = "#333";
                cartLink.style.fontSize = "18px";

                const cartIcon = document.createElement("i");
                cartIcon.className = "fas fa-shopping-cart";

                const cartCount = document.createElement("span");
                cartCount.className = "cart-count";
                cartCount.style.position = "absolute";
                cartCount.style.top = "-8px";
                cartCount.style.right = "-8px";
                cartCount.style.backgroundColor = "#000";
                cartCount.style.color = "#fff";
                cartCount.style.fontSize = "10px";
                cartCount.style.width = "16px";
                cartCount.style.height = "16px";
                cartCount.style.borderRadius = "50%";
                cartCount.style.display = "flex";
                cartCount.style.alignItems = "center";
                cartCount.style.justifyContent = "center";

                // Get cart count from API
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
                        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0) || "0";
                    } catch (error) {
                        console.error('Error getting cart count:', error);
                        cartCount.textContent = "0";
                    }
                }

                // Update cart count initially
                updateCartCount();

                cartLink.appendChild(cartIcon);
                cartLink.appendChild(cartCount);
                iconsGroup.appendChild(cartLink);
            }

            signUpButton.appendChild(iconsGroup);
        }
    }
});
  
  