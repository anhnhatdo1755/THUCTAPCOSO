// Add this script to cart.html and checkout.html to require login

document.addEventListener("DOMContentLoaded", function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("fascoUser"));
    const isLoggedIn = currentUser && currentUser.isLoggedIn;
    
    // Get current page
    const currentPage = window.location.pathname.split("/").pop();
    
    // Pages that require authentication
    const restrictedPages = ["cart.html", "checkout.html"];
    
    // Check if current page requires authentication
    if (restrictedPages.includes(currentPage) && !isLoggedIn) {
        // Save the current page URL to redirect back after login
        localStorage.setItem("redirectAfterLogin", window.location.href);
        
        // Silently redirect to login page without showing an alert
        window.location.href = "signin.html";
        return; // Stop execution to prevent the rest of the script from running
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