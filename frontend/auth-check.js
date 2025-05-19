// Add this script to cart.html and checkout.html to require login

document.addEventListener("DOMContentLoaded", async function() {
    const API_URL = 'http://localhost:3000/api';
    let token = localStorage.getItem('token');
    let user = JSON.parse(localStorage.getItem('user'));

    // Get current page
    const currentPage = window.location.pathname.split("/").pop();

    // Pages that require authentication
    const restrictedPages = ["cart.html", "checkout.html", "admin.html"];

    // Check if current page requires authentication
    if (restrictedPages.includes(currentPage)) {
        if (!token || !user) {
            // Save the current page URL to redirect back after login
            localStorage.setItem("redirectAfterLogin", window.location.href);
            window.location.href = "signin.html";
            return;
        }

        // Check if user has permission to access the page
        if (currentPage === "admin.html" && user.role !== "admin") {
            window.location.href = "homepage.html";
            return;
        }
    }

    // Update header UI to be consistent
    await updateHeaderUI(user);
});

// Function to update header UI based on login status
async function updateHeaderUI(user) {
    const API_URL = 'http://localhost:3000/api';
    let token = localStorage.getItem('token');
    const iconsGroup = document.querySelector(".icons-group");

    if (!iconsGroup) return;

    // Clear existing icons
    iconsGroup.innerHTML = "";

    if (user) {
        // User icon/profile link
        const userLink = document.createElement("a");
        userLink.href = user.role === "admin" ? "admin.html" : "#";
        userLink.className = "icon-link";
        userLink.innerHTML = '<i class="fas fa-user"></i>';
        iconsGroup.appendChild(userLink);

        // Logout icon
        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.className = "icon-link logout-icon";
        logoutLink.title = "Logout";
        logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i>';

        // Add logout functionality
        logoutLink.addEventListener("click", async function(e) {
            e.preventDefault();
            try {
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

                // Redirect to homepage
                window.location.href = "homepage.html";
            } catch (error) {
                console.error('Error logging out:', error);
                alert('Failed to logout. Please try again.');
            }
        });

        // Cart icon with count (only for non-admin users)
        if (user.role !== 'admin') {
            const cartLink = document.createElement("a");
            cartLink.href = "cart.html";
            cartLink.className = "icon-link cart-icon";

            try {
                const response = await fetch(`${API_URL}/cart`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to get cart');
                const data = await response.json();
                const cart = data.products || [];
                const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

                cartLink.innerHTML = `
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">${cartCount}</span>
                `;
            } catch (error) {
                console.error('Error getting cart count:', error);
                cartLink.innerHTML = `
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-count">0</span>
                `;
            }

            iconsGroup.appendChild(cartLink);
        }

        iconsGroup.appendChild(logoutLink);
    } else {
        // Sign in link
        const signInLink = document.createElement("a");
        signInLink.href = "signin.html";
        signInLink.className = "icon-link";
        signInLink.innerHTML = '<i class="fas fa-user"></i>';
        iconsGroup.appendChild(signInLink);

        // Cart icon with count
        const cartLink = document.createElement("a");
        cartLink.href = "cart.html";
        cartLink.className = "icon-link cart-icon";
        cartLink.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count">0</span>
        `;
        iconsGroup.appendChild(cartLink);
    }
}