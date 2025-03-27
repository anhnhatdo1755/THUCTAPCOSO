document.addEventListener('DOMContentLoaded', () => {
    // Size Filter Functionality
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle active state
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Color Filter Functionality
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle active state
            colorButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Price Range Slider
    const priceRangeInput = document.querySelector('.price-range input');
    const priceLabels = document.querySelector('.price-labels');
    priceRangeInput.addEventListener('input', () => {
        const value = priceRangeInput.value;
        priceLabels.querySelector('span:last-child').textContent = `$${value}`;
    });

    // View Mode Toggle
    const gridViewBtn = document.querySelector('.grid-view');
    const listViewBtn = document.querySelector('.list-view');
    const productListings = document.querySelector('.product-listings1');

    gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        productListings.classList.remove('list-view');
    });

    listViewBtn.addEventListener('click', () => {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        productListings.classList.add('list-view');
    });

    // Quick View and Add to Cart Functionality
    const productCards = document.querySelectorAll('.product-card1');
    productCards.forEach(card => {
        const quickViewBtn = card.querySelector('.quick-view');
        const addToCartBtn = card.querySelector('.add-to-cart');

        quickViewBtn.addEventListener('click', () => {
            // Placeholder for quick view modal
            alert('Quick View functionality to be implemented');
        });

        addToCartBtn.addEventListener('click', () => {
            // Placeholder for add to cart functionality
            alert('Added to cart!');
        });
    });

    // Sorting Functionality
    const sortSelect = document.querySelector('.sort-options1 select');
    sortSelect.addEventListener('change', () => {
        const selectedOption = sortSelect.value;
        const productCards = Array.from(document.querySelectorAll('.product-card1'));

        switch(selectedOption) {
            case 'Price: Low to High':
                productCards.sort((a, b) => {
                    const priceA = parseFloat(a.querySelector('.product-price1').textContent.replace('$', ''));
                    const priceB = parseFloat(b.querySelector('.product-price1').textContent.replace('$', ''));
                    return priceA - priceB;
                });
                break;
            case 'Price: High to Low':
                productCards.sort((a, b) => {
                    const priceA = parseFloat(a.querySelector('.product-price1').textContent.replace('$', ''));
                    const priceB = parseFloat(b.querySelector('.product-price1').textContent.replace('$', ''));
                    return priceB - priceA;
                });
                break;
            // Additional sorting logic can be added here
        }

        // Re-append sorted cards to maintain DOM order
        const productListings = document.querySelector('.product-listings1');
        productCards.forEach(card => productListings.appendChild(card));
    });

    // Pagination 
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            pageButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');

            // Placeholder for actual pagination logic
            alert(`Showing page ${button.textContent}`);
        });
    });
});