// Add this script to all pages to handle sign-in redirects

document.addEventListener("DOMContentLoaded", function() {
    // Find all sign-in links on the page
    const signInLinks = document.querySelectorAll('a[href="signin.html"]');
    
    // Add click event listener to all sign-in links
    signInLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Save the current page URL to redirect back after login
            localStorage.setItem("redirectAfterLogin", window.location.href);
        });
    });
    
    // Also handle the user icon if it links to signin.html
    const userIcons = document.querySelectorAll('.icon-link .fa-user, .icon-link.fa-user');
    userIcons.forEach(icon => {
        const parentLink = icon.closest('a');
        if (parentLink && parentLink.getAttribute('href') === 'signin.html') {
            parentLink.addEventListener('click', function(e) {
                localStorage.setItem("redirectAfterLogin", window.location.href);
            });
        }
    });
    
    // Check if this is a restricted page (cart or checkout)
    const currentPage = window.location.pathname.split("/").pop();
    const restrictedPages = ["cart.html", "checkout.html"];
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("fascoUser"));
    const isLoggedIn = currentUser && currentUser.isLoggedIn;
    
    // If this is a restricted page and user is not logged in, redirect to login
    if (restrictedPages.includes(currentPage) && !isLoggedIn) {
        // Save the current page URL to redirect back after login
        localStorage.setItem("redirectAfterLogin", window.location.href);
        
        // Silently redirect to login page
        window.location.href = "signin.html";
        return;
    }
    
    // Update header UI to be consistent
    updateHeaderUI(currentUser);
});

// Function to update header UI based on login status
function updateHeaderUI(currentUser) {
    const isLoggedIn = currentUser && currentUser.isLoggedIn;
    const iconsGroup = document.querySelector(".icons-group");
    
    if (!iconsGroup) return;
    
    // Clear existing icons
    iconsGroup.innerHTML = "";
    
    if (isLoggedIn) {
        // User icon/profile link
        const userLink = document.createElement("a");
        userLink.href = currentUser.role === "admin" ? "admin.html" : "#";
        userLink.className = "icon-link";
        userLink.innerHTML = '<i class="fas fa-user"></i>';
        iconsGroup.appendChild(userLink);
        
        // Cart icon with count
        const cartLink = document.createElement("a");
        cartLink.href = "cart.html";
        cartLink.className = "icon-link cart-icon";
        
        // Get cart count
        const cart = JSON.parse(localStorage.getItem("fascoCart")) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartLink.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count">${cartCount}</span>
        `;
        iconsGroup.appendChild(cartLink);
        
        // Logout icon
        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.className = "icon-link logout-icon";
        logoutLink.title = "Logout";
        logoutLink.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
        
        // Add logout functionality
        logoutLink.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem("fascoUser");
            window.location.href = "homepage.html";
        });
        
        iconsGroup.appendChild(logoutLink);
    } else {
        // Sign in link
        const signInLink = document.createElement("a");
        signInLink.href = "signin.html";
        signInLink.className = "icon-link";
        signInLink.innerHTML = '<i class="fas fa-user"></i>';
        
        // Save current page for redirect after login
        signInLink.addEventListener('click', function() {
            localStorage.setItem("redirectAfterLogin", window.location.href);
        });
        
        iconsGroup.appendChild(signInLink);
        
        // Cart icon with count
        const cartLink = document.createElement("a");
        cartLink.href = "cart.html";
        cartLink.className = "icon-link cart-icon";
        
        // Get cart count
        const cart = JSON.parse(localStorage.getItem("fascoCart")) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartLink.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-count">${cartCount}</span>
        `;
        iconsGroup.appendChild(cartLink);
    }
}