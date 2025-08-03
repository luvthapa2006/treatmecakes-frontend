// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Mobile navigation toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Set minimum date for delivery to tomorrow
    const deliveryDateInput = document.getElementById('delivery-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deliveryDateInput.min = tomorrow.toISOString().split('T')[0];

    // Load existing reviews on page load
    loadReviews();
    
    // Initialize order form
    initializeOrderForm();
    
    // Initialize feedback form
    initializeFeedbackForm();
});

// Smooth scrolling to sections
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Order form functionality
function initializeOrderForm() {
    const orderForm = document.getElementById('order-form');
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateOrderForm()) {
            showOrderSummary();
        }
    });
}

// Validate order form
function validateOrderForm() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    let isValid = true;
    let errorMessages = [];

    // Validate required fields
    const requiredFields = [
        'product', 'flavor', 'weight', 'deliveryDate', 
        'customerName', 'phone', 'email', 'address', 'sector', 'pincode'
    ];

    requiredFields.forEach(field => {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            isValid = false;
            errorMessages.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        }
    });

    // Validate phone number
    const phone = formData.get('phone');
    if (phone && !/^\d{10}$/.test(phone)) {
        isValid = false;
        errorMessages.push('Phone number must be 10 digits');
    }

    // Validate email
    const email = formData.get('email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        isValid = false;
        errorMessages.push('Please enter a valid email address');
    }

    // Validate pincode (Gurugram area codes)
    const pincode = formData.get('pincode');
    const gurugramPincodes = ['122001', '122002', '122003', '122004', '122005', '122006', '122007', '122008', '122009', '122010', '122011', '122015', '122016', '122017', '122018', '122050', '122051', '122052', '122102', '122103'];
    
    if (pincode && !gurugramPincodes.includes(pincode)) {
        isValid = false;
        errorMessages.push('We currently deliver only in Gurugram area. Please enter a valid Gurugram pincode.');
    }

    // Validate delivery date
    const deliveryDate = new Date(formData.get('deliveryDate'));
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (deliveryDate < tomorrow) {
        isValid = false;
        errorMessages.push('Delivery date must be at least 1 day from today');
    }

    if (!isValid) {
        showErrorMessage(errorMessages.join('\n'));
    }

    return isValid;
}

// Show order summary modal
function showOrderSummary() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    const modal = document.getElementById('order-summary-modal');
    const summaryContent = document.getElementById('order-summary-content');
    
    // Calculate estimated price
    const product = formData.get('product');
    const weight = parseFloat(formData.get('weight'));
    let basePrice = 0;
    
    switch(product) {
        case 'Birthday Cake':
            basePrice = 800;
            break;
        case 'Wedding Cake':
            basePrice = 2500;
            break;
        case 'Cupcakes':
            basePrice = 80 * 12; // Assuming dozen
            break;
        case 'Pastries':
            basePrice = 150;
            break;
    }
    
    const estimatedPrice = Math.round(basePrice * weight);
    
    // Create order summary HTML
    summaryContent.innerHTML = `
        <div class="order-summary">
            <h3>Order Details</h3>
            <div class="summary-item">
                <strong>Product:</strong> ${product}
            </div>
            <div class="summary-item">
                <strong>Flavor:</strong> ${formData.get('flavor')}
            </div>
            <div class="summary-item">
                <strong>Weight:</strong> ${formData.get('weight')} kg
            </div>
            <div class="summary-item">
                <strong>Custom Message:</strong> ${formData.get('message') || 'None'}
            </div>
            <div class="summary-item">
                <strong>Delivery Date:</strong> ${formatDate(formData.get('deliveryDate'))}
            </div>
            <div class="summary-item price-item">
                <strong>Estimated Price: ₹${estimatedPrice}</strong>
            </div>
            
            <h3>Customer Information</h3>
            <div class="summary-item">
                <strong>Name:</strong> ${formData.get('customerName')}
            </div>
            <div class="summary-item">
                <strong>Phone:</strong> ${formData.get('phone')}
            </div>
            <div class="summary-item">
                <strong>Email:</strong> ${formData.get('email')}
            </div>
            
            <h3>Delivery Address</h3>
            <div class="summary-item">
                <strong>Address:</strong> ${formData.get('address')}
            </div>
            <div class="summary-item">
                <strong>Sector:</strong> ${formData.get('sector')}
            </div>
            <div class="summary-item">
                <strong>Pincode:</strong> ${formData.get('pincode')}
            </div>
            
            <div class="note">
                <strong>Note:</strong> This is an order confirmation. Our team will contact you within 2 hours to confirm details and arrange payment.
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Close modal when clicking X
    document.querySelector('.close').onclick = function() {
        modal.style.display = 'none';
    };
}

// Confirm order and save to localStorage
function confirmOrder() {
    const form = document.getElementById('order-form');
    const formData = new FormData(form);
    
    // Create order object
    const order = {
        customOrderId: 'ORDER-' + Date.now(),
        timestamp: new Date().toISOString(),
        product: formData.get('product'),
        flavor: formData.get('flavor'),
        weight: formData.get('weight'),
        message: formData.get('message'),
        deliveryDate: formData.get('deliveryDate'),
        customer: {
            name: formData.get('customerName'),
            phone: formData.get('phone'),
            email: formData.get('email')
        },
        address: {
            street: formData.get('address'),
            sector: formData.get('sector'),
            pincode: formData.get('pincode')
        },
        status: 'confirmed'
    };
    
// Send order to backend
fetch("https://treatmecakes-backend.onrender.com/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
})
.then(res => res.json())
.then(data => {
    if (data.success) {
        showSuccessMessage("Order placed successfully! Order ID: " + data.orderId);
    } else {
        showErrorMessage("Something went wrong! Please try again later.");
    }
})
.catch(err => {
    console.error("Error sending order:", err);
    showErrorMessage("Failed to send order. Please check your internet connection.");
});

    
    // Close modal
    closeModal();
    
    // Show success message and reset form
    showSuccessMessage('Order confirmed successfully! Our team will contact you within 2 hours. Order ID: ' + order.id);
    form.reset();
    
    // Set minimum date again after reset
    const deliveryDateInput = document.getElementById('delivery-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
}

// Close modal
function closeModal() {
    document.getElementById('order-summary-modal').style.display = 'none';
}

// Save order to localStorage
function saveOrder(order) {
    let orders = getOrders();
    orders.push(order);
    localStorage.setItem('treatMeCakesOrders', JSON.stringify(orders));
}

// Get orders from localStorage
function getOrders() {
    const orders = localStorage.getItem('treatMeCakesOrders');
    return orders ? JSON.parse(orders) : [];
}

// Feedback form functionality
function initializeFeedbackForm() {
    const feedbackForm = document.getElementById('feedback-form');
    
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateFeedbackForm()) {
            saveFeedback();
        }
    });
}

// Validate feedback form
function validateFeedbackForm() {
    const form = document.getElementById('feedback-form');
    const formData = new FormData(form);
    let isValid = true;
    let errorMessages = [];

    // Validate required fields
    const requiredFields = ['reviewerName', 'rating', 'review'];

    requiredFields.forEach(field => {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            isValid = false;
            errorMessages.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        }
    });

    if (!isValid) {
        showErrorMessage(errorMessages.join('\n'));
    }

    return isValid;
}

// Save feedback to localStorage
function saveFeedback() {
    const form = document.getElementById('feedback-form');
    const formData = new FormData(form);
    
    const feedback = {
        id: 'REVIEW-' + Date.now(),
        timestamp: new Date().toISOString(),
        reviewerName: formData.get('reviewerName'),
        rating: parseInt(formData.get('rating')),
        review: formData.get('review')
    };
    
    let reviews = getReviews();
    reviews.unshift(feedback); // Add to beginning of array
    localStorage.setItem('treatMeCakesReviews', JSON.stringify(reviews));
    
    // Show success message and reset form
    showSuccessMessage('Thank you for your feedback! Your review has been submitted successfully.');
    form.reset();
    
    // Reload reviews
    loadReviews();
}

// Get reviews from localStorage
function getReviews() {
    const reviews = localStorage.getItem('treatMeCakesReviews');
    return reviews ? JSON.parse(reviews) : [];
}

// Load and display reviews
function loadReviews() {
    const reviews = getReviews();
    const reviewsList = document.getElementById('reviews-list');
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-reviews">
                <p>No reviews yet. Be the first to share your experience!</p>
            </div>
        `;
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <span class="reviewer-name">${escapeHtml(review.reviewerName)}</span>
                <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p class="review-text">${escapeHtml(review.review)}</p>
            <p class="review-date">${formatDate(review.timestamp)}</p>
        </div>
    `).join('');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccessMessage(message) {
    // Create or update success message element
    let successDiv = document.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        document.body.appendChild(successDiv);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    successDiv.style.position = 'fixed';
    successDiv.style.top = '100px';
    successDiv.style.left = '50%';
    successDiv.style.transform = 'translateX(-50%)';
    successDiv.style.zIndex = '2001';
    successDiv.style.maxWidth = '500px';
    
    // Hide after 5 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

function showErrorMessage(message) {
    // Create or update error message element
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '100px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.zIndex = '2001';
    errorDiv.style.maxWidth = '500px';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Add CSS for order summary styling
const summaryStyles = `
    .order-summary {
        line-height: 1.8;
    }
    
    .summary-item {
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .summary-item:last-child {
        border-bottom: none;
    }
    
    .price-item {
        background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        font-size: 1.1rem;
        color: #2e7d32;
    }
    
    .note {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        padding: 15px;
        border-radius: 8px;
        margin-top: 20px;
        color: #ef6c00;
        font-size: 0.95rem;
    }
    
    .no-reviews {
        text-align: center;
        padding: 40px;
        color: #666;
        font-style: italic;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = summaryStyles;
document.head.appendChild(styleSheet);

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
