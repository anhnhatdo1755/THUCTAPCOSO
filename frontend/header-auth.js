document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("fascoUser"))
  
    // Get navigation elements
    const navLinks = document.querySelector(".nav-links")
    const signUpButton = document.querySelector(".sign-up")
  
    if (currentUser && currentUser.isLoggedIn) {
      // User is logged in, update the navigation
  
      // Find the Sign In link and remove it
      const signInLink = navLinks.querySelector('a[href="signin.html"]')
      if (signInLink) {
        const signInListItem = signInLink.parentElement
        signInListItem.remove()
      }
  
      // Remove the Sign Up button
      if (signUpButton) {
        signUpButton.innerHTML = ""
  
        // Create user icon similar to cart page
        const iconsGroup = document.createElement("div")
        iconsGroup.className = "icons-group"
        iconsGroup.style.display = "flex"
        iconsGroup.style.alignItems = "center"
        iconsGroup.style.gap = "15px"
  
        // Add user icon
        const userLink = document.createElement("a")
        userLink.href = currentUser.role === "admin" ? "admin.html" : "#"
        userLink.className = "icon-link"
        userLink.style.position = "relative"
        userLink.style.color = "#333"
        userLink.style.fontSize = "18px"
  
        const userIcon = document.createElement("i")
        userIcon.className = "fas fa-user"
  
        userLink.appendChild(userIcon)
        iconsGroup.appendChild(userLink)
  
        // Add logout icon
        const logoutLink = document.createElement("a")
        logoutLink.href = "#"
        logoutLink.className = "icon-link logout-icon"
        logoutLink.style.position = "relative"
        logoutLink.style.color = "#333"
        logoutLink.style.fontSize = "18px"
        logoutLink.title = "Logout"
  
        const logoutIcon = document.createElement("i")
        logoutIcon.className = "fas fa-sign-out-alt"
  
        logoutLink.appendChild(logoutIcon)
        iconsGroup.appendChild(logoutLink)
  
        // Add logout functionality
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault()
          localStorage.removeItem("fascoUser")
          window.location.reload()
        })
  
        // Add cart icon if not already present
        if (!document.querySelector(".cart-icon")) {
          const cartLink = document.createElement("a")
          cartLink.href = "cart.html"
          cartLink.className = "icon-link cart-icon"
          cartLink.style.position = "relative"
          cartLink.style.color = "#333"
          cartLink.style.fontSize = "18px"
  
          const cartIcon = document.createElement("i")
          cartIcon.className = "fas fa-shopping-cart"
  
          const cartCount = document.createElement("span")
          cartCount.className = "cart-count"
          cartCount.style.position = "absolute"
          cartCount.style.top = "-8px"
          cartCount.style.right = "-8px"
          cartCount.style.backgroundColor = "#000"
          cartCount.style.color = "#fff"
          cartCount.style.fontSize = "10px"
          cartCount.style.width = "16px"
          cartCount.style.height = "16px"
          cartCount.style.borderRadius = "50%"
          cartCount.style.display = "flex"
          cartCount.style.alignItems = "center"
          cartCount.style.justifyContent = "center"
  
          // Get cart count from localStorage
          const cart = JSON.parse(localStorage.getItem("fascoCart")) || []
          cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0) || "0"
  
          cartLink.appendChild(cartIcon)
          cartLink.appendChild(cartCount)
          iconsGroup.appendChild(cartLink)
        }
  
        signUpButton.appendChild(iconsGroup)
      }
    }
  })
  
  