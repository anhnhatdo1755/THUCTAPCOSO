// Add this script to signin.html to handle redirects after login

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            
            // Admin authentication
            if ((email === "admin" || email === "admin@fasco.com") && password === "123") {
                const adminUser = {
                    name: "Admin",
                    email: "admin@fasco.com",
                    role: "admin",
                    isLoggedIn: true
                };
                
                // Save user info to localStorage
                localStorage.setItem("fascoUser", JSON.stringify(adminUser));
                
                // Check if there's a redirect URL
                const redirectUrl = localStorage.getItem("redirectAfterLogin");
                if (redirectUrl) {
                    localStorage.removeItem("redirectAfterLogin");
                    window.location.href = redirectUrl;
                } else {
                    // Redirect to admin page
                    window.location.href = "admin.html";
                }
                return;
            }
            
            // Regular user authentication
            if (email === "anh@gmail.com" && password === "123") {
                const regularUser = {
                    name: "Anh",
                    email: "anh@gmail.com",
                    role: "user",
                    isLoggedIn: true
                };
                
                // Save user info to localStorage
                localStorage.setItem("fascoUser", JSON.stringify(regularUser));
                
                // Check if there's a redirect URL
                const redirectUrl = localStorage.getItem("redirectAfterLogin");
                if (redirectUrl) {
                    localStorage.removeItem("redirectAfterLogin");
                    window.location.href = redirectUrl;
                } else {
                    // Redirect to homepage
                    window.location.href = "homepage.html";
                }
                return;
            }
            
            // Authentication failed
            alert("Invalid email or password. Please try again.");
        });
    }
});