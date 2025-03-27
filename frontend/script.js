// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Deals Slider
    let currentDealsSlide = 0;
    const dealsSlides = document.querySelectorAll('.deals-slide');
    const dealsDots = document.querySelectorAll('.deals .dot');
    const dealsPrevBtn = document.querySelector('.deals .prev');
    const dealsNextBtn = document.querySelector('.deals .next');

    // Initialize deals slider
    function showDealsSlide(n) {
        // Reset current slide
        dealsSlides.forEach(slide => {
            slide.style.display = 'none';
        });
        
        dealsDots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Set current slide
        currentDealsSlide = (n + dealsSlides.length) % dealsSlides.length;
        
        // Show slides (up to 3 at a time on desktop)
        const slidesToShow = window.innerWidth < 768 ? 1 : 3;
        for (let i = 0; i < slidesToShow; i++) {
            const slideIndex = (currentDealsSlide + i) % dealsSlides.length;
            if (dealsSlides[slideIndex]) {
                dealsSlides[slideIndex].style.display = 'block';
            }
        }
        
        dealsDots[currentDealsSlide].classList.add('active');
    }

    // Initialize deals slider
    showDealsSlide(0);

    // Add event listeners for deals slider controls
    if (dealsPrevBtn) {
        dealsPrevBtn.addEventListener('click', () => {
            showDealsSlide(currentDealsSlide - 1);
        });
    }

    if (dealsNextBtn) {
        dealsNextBtn.addEventListener('click', () => {
            showDealsSlide(currentDealsSlide + 1);
        });
    }

    dealsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showDealsSlide(index);
        });
    });

    // Testimonials Slider
    let currentTestimonialSlide = 0;
    const testimonialSlides = document.querySelectorAll('.testimonial');
    const testimonialDots = document.querySelectorAll('.testimonials .dot');
    const testimonialPrevBtn = document.querySelector('.testimonials .prev');
    const testimonialNextBtn = document.querySelector('.testimonials .next');

    // Initialize testimonials slider
    function showTestimonialSlide(n) {
        testimonialSlides.forEach(slide => {
            slide.style.display = 'none';
        });
        
        testimonialDots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        currentTestimonialSlide = (n + testimonialSlides.length) % testimonialSlides.length;
        testimonialSlides[currentTestimonialSlide].style.display = 'block';
        testimonialDots[currentTestimonialSlide].classList.add('active');
    }

    // Initialize testimonials slider
    showTestimonialSlide(0);

    // Add event listeners for testimonials slider controls
    if (testimonialPrevBtn) {
        testimonialPrevBtn.addEventListener('click', () => {
            showTestimonialSlide(currentTestimonialSlide - 1);
        });
    }

    if (testimonialNextBtn) {
        testimonialNextBtn.addEventListener('click', () => {
            showTestimonialSlide(currentTestimonialSlide + 1);
        });
    }

    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonialSlide(index);
        });
    });

    // Category Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Filter products
            const category = btn.textContent.toLowerCase();
            
            if (category === 'all products') {
                // Show all products
                productCards.forEach(card => {
                    card.style.display = 'block';
                });
            } else {
                // Show only products in the selected category
                productCards.forEach(card => {
                    const productCategory = card.querySelector('.product-category').textContent.toLowerCase();
                    if (productCategory.includes(category)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    });

    // Countdown Timer
    const daysElement = document.querySelector('.time-block:nth-child(1) .number');
    const hoursElement = document.querySelector('.time-block:nth-child(2) .number');
    const minutesElement = document.querySelector('.time-block:nth-child(3) .number');
    const secondsElement = document.querySelector('.time-block:nth-child(4) .number');

    // Set the countdown date (3 days from now)
    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 3);

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = countdownDate - now;
        
        // Calculate days, hours, minutes, and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update the countdown elements
        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // If the countdown is over, display a message
        if (distance < 0) {
            clearInterval(countdownInterval);
            if (daysElement) daysElement.textContent = '00';
            if (hoursElement) hoursElement.textContent = '00';
            if (minutesElement) minutesElement.textContent = '00';
            if (secondsElement) secondsElement.textContent = '00';
        }
    }

    // Update the countdown every second
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    // Mobile Menu Toggle
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.classList.add('mobile-menu-btn');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    const header = document.querySelector('header .container');
    const navLinks = document.querySelector('.nav-links');
    
    if (header && navLinks) {
        header.insertBefore(mobileMenuBtn, navLinks);
        
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
        
        // Add mobile menu styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    display: block;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    position: absolute;
                    top: 20px;
                    right: 20px;
                }
                
                .nav-links {
                    display: none;
                }
                
                .nav-links.show {
                    display: flex;
                }
            }
            
            @media (min-width: 769px) {
                .mobile-menu-btn {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
});