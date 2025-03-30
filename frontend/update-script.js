// Add this script to homepage.html and shop.html right before the closing </body> tag
document.addEventListener("DOMContentLoaded", () => {
    // Check if header-auth.js is already loaded
    if (!window.headerAuthLoaded) {
      const script = document.createElement("script")
      script.src = "header-auth.js"
      script.onload = () => {
        window.headerAuthLoaded = true
      }
      document.body.appendChild(script)
    }
  })
  
  