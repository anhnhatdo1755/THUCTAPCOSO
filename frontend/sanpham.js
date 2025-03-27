document.addEventListener('DOMContentLoaded', function() {
    // Thumbnail image selection
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.product-main-image img');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Update main image
            const thumbnailImg = this.querySelector('img');
            mainImage.src = thumbnailImg.src;
        });
    });
    
    // Size selection
    const sizeOptions = document.querySelectorAll('.size-option');
    
    sizeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all size options
            sizeOptions.forEach(o => o.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
        });
    });
    
    // Color selection
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all color options
            colorOptions.forEach(o => o.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update color label
            const colorLabel = document.querySelector('.option-group label:nth-of-type(2)');
            let colorName = '';
            
            if (this.classList.contains('blue')) {
                colorName = 'Blue';
            } else if (this.classList.contains('black')) {
                colorName = 'Black';
            } else if (this.classList.contains('pink')) {
                colorName = 'Pink';
            }
            
            colorLabel.textContent = `Color: ${colorName}`;
        });
    });
    
    // Quantity selector
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const quantityInput = document.querySelector('.quantity-input');
    
    minusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    plusBtn.addEventListener('click', function() {
        let currentValue = parseInt(quantityInput.value);
        const maxStock = 9; // Based on the "Only 9 items left in stock"
        if (currentValue < maxStock) {
            quantityInput.value = currentValue + 1;
        }
    });
    
    // Add to cart button
    const addToCartBtn = document.querySelector('.btn-add-to-cart');
    
    addToCartBtn.addEventListener('click', function() {
        const productTitle = document.querySelector('.product-title').textContent;
        const quantity = parseInt(quantityInput.value);
        
        // Get selected size
        let selectedSize = 'M'; // Default
        sizeOptions.forEach(option => {
            if (option.classList.contains('active')) {
                selectedSize = option.textContent;
            }
        });
        
        // Get selected color
        let selectedColor = 'Blue'; // Default
        colorOptions.forEach(option => {
            if (option.classList.contains('active')) {
                if (option.classList.contains('blue')) {
                    selectedColor = 'Blue';
                } else if (option.classList.contains('black')) {
                    selectedColor = 'Black';
                } else if (option.classList.contains('pink')) {
                    selectedColor = 'Pink';
                }
            }
        });
        
        // Show confirmation message
        alert(`Added to cart: ${quantity} x ${productTitle} (${selectedColor}, Size ${selectedSize})`);
    });
    
    // Related products slider
    const prevArrow = document.querySelector('.slider-arrow.prev');
    const nextArrow = document.querySelector('.slider-arrow.next');
    const sliderDots = document.querySelectorAll('.slider-dot');
    
    // Simulate slider functionality
    prevArrow.addEventListener('click', function() {
        // Move active dot to previous
        let activeIndex = 0;
        sliderDots.forEach((dot, index) => {
            if (dot.classList.contains('active')) {
                activeIndex = index;
            }
        });
        
        sliderDots.forEach(dot => dot.classList.remove('active'));
        
        if (activeIndex === 0) {
            sliderDots[sliderDots.length - 1].classList.add('active');
        } else {
            sliderDots[activeIndex - 1].classList.add('active');
        }
    });
    
    nextArrow.addEventListener('click', function() {
        // Move active dot to next
        let activeIndex = 0;
        sliderDots.forEach((dot, index) => {
            if (dot.classList.contains('active')) {
                activeIndex = index;
            }
        });
        
        sliderDots.forEach(dot => dot.classList.remove('active'));
        
        if (activeIndex === sliderDots.length - 1) {
            sliderDots[0].classList.add('active');
        } else {
            sliderDots[activeIndex + 1].classList.add('active');
        }
    });
    
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            sliderDots.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
        });
    });
});