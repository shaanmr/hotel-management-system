// Booking system using localStorage
class BookingSystem {
    constructor() {
        this.bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    }

    // Create a new booking
    createBooking(userId, roomName, checkIn, checkOut, price) {
        const booking = {
            id: Date.now(),
            userId,
            roomName,
            checkIn,
            checkOut,
            price,
            status: 'confirmed'
        };

        this.bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
        return booking;
    }

    // Get user's bookings
    getUserBookings(userId) {
        return this.bookings.filter(booking => booking.userId === userId);
    }

    // Cancel a booking
    cancelBooking(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = 'cancelled';
            localStorage.setItem('bookings', JSON.stringify(this.bookings));
            return true;
        }
        return false;
    }
}

// Create booking system instance
const bookingSystem = new BookingSystem();

// Create booking modal
const bookingModal = document.createElement('div');
bookingModal.className = 'booking-modal';
bookingModal.innerHTML = `
    <div class="booking-content">
        <span class="close">&times;</span>
        <h2>Book a Room</h2>
        <form id="booking-form">
            <div class="form-group">
                <label for="check-in">Check-in Date</label>
                <input type="date" id="check-in" required>
            </div>
            <div class="form-group">
                <label for="check-out">Check-out Date</label>
                <input type="date" id="check-out" required>
            </div>
            <div class="form-group">
                <label for="guests">Number of Guests</label>
                <input type="number" id="guests" min="1" max="4" required>
            </div>
            <button type="submit">Confirm Booking</button>
        </form>
    </div>
`;

// Add booking modal to body
document.body.appendChild(bookingModal);

// Add booking modal styles
const bookingStyle = document.createElement('style');
bookingStyle.textContent = `
    .booking-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
    }

    .booking-content {
        position: relative;
        background: white;
        margin: 15% auto;
        padding: 2rem;
        width: 90%;
        max-width: 400px;
        border-radius: 10px;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #2c3e50;
    }

    .form-group input {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    #booking-form button {
        width: 100%;
        padding: 1rem;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
    }

    #booking-form button:hover {
        background: #2980b9;
    }
`;
document.head.appendChild(bookingStyle);

// Handle booking button clicks
document.querySelectorAll('.book-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (!auth.isLoggedIn()) {
            alert('Please login to book a room');
            loginForm.style.display = 'block';
            return;
        }

        const roomCard = button.closest('.room-card');
        const roomName = roomCard.querySelector('h3').textContent;
        const roomPrice = roomCard.querySelector('.price').textContent;

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('check-in').min = today;
        document.getElementById('check-out').min = today;

        bookingModal.style.display = 'block';
        bookingModal.dataset.roomName = roomName;
        bookingModal.dataset.roomPrice = roomPrice;
    });
});

// Close booking modal
bookingModal.querySelector('.close').addEventListener('click', () => {
    bookingModal.style.display = 'none';
});

// Handle booking form submission
document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const checkIn = e.target[0].value;
    const checkOut = e.target[1].value;
    const guests = e.target[2].value;
    const roomName = bookingModal.dataset.roomName;
    const roomPrice = bookingModal.dataset.roomPrice;

    // Validate dates
    if (new Date(checkIn) >= new Date(checkOut)) {
        alert('Check-out date must be after check-in date');
        return;
    }

    // Create booking
    const booking = bookingSystem.createBooking(
        auth.getCurrentUser().id,
        roomName,
        checkIn,
        checkOut,
        roomPrice
    );

    alert('Booking confirmed! Thank you for choosing our hotel.');
    bookingModal.style.display = 'none';
    e.target.reset();
});

// Add booking history section
const bookingHistory = document.createElement('section');
bookingHistory.className = 'booking-history';
bookingHistory.innerHTML = `
    <h2>Your Bookings</h2>
    <div class="bookings-list"></div>
`;
document.querySelector('.rooms').after(bookingHistory);

// Add booking history styles
const historyStyle = document.createElement('style');
historyStyle.textContent = `
    .booking-history {
        padding: 5rem 5%;
        background: #f9f9f9;
    }

    .booking-history h2 {
        text-align: center;
        margin-bottom: 3rem;
        color: #2c3e50;
    }

    .bookings-list {
        display: grid;
        gap: 1rem;
    }

    .booking-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }

    .booking-card h3 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }

    .booking-card p {
        margin-bottom: 0.5rem;
    }

    .booking-card .status {
        display: inline-block;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.9rem;
        margin-top: 1rem;
    }

    .booking-card .status.confirmed {
        background: #2ecc71;
        color: white;
    }

    .booking-card .status.cancelled {
        background: #e74c3c;
        color: white;
    }

    .booking-card button {
        padding: 0.5rem 1rem;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
    }

    .booking-card button:hover {
        background: #c0392b;
    }
`;
document.head.appendChild(historyStyle);

// Update booking history
function updateBookingHistory() {
    const bookingsList = document.querySelector('.bookings-list');
    if (!bookingsList) return;

    if (!auth.isLoggedIn()) {
        bookingsList.innerHTML = '<p>Please login to view your bookings</p>';
        return;
    }

    const userBookings = bookingSystem.getUserBookings(auth.getCurrentUser().id);
    
    if (userBookings.length === 0) {
        bookingsList.innerHTML = '<p>No bookings found</p>';
        return;
    }

    bookingsList.innerHTML = userBookings.map(booking => `
        <div class="booking-card">
            <h3>${booking.roomName}</h3>
            <p>Check-in: ${booking.checkIn}</p>
            <p>Check-out: ${booking.checkOut}</p>
            <p>Price: ${booking.price}</p>
            <span class="status ${booking.status}">${booking.status}</span>
            ${booking.status === 'confirmed' ? `
                <button onclick="cancelBooking(${booking.id})">Cancel Booking</button>
            ` : ''}
        </div>
    `).join('');
}

// Cancel booking function
window.cancelBooking = function(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        bookingSystem.cancelBooking(bookingId);
        updateBookingHistory();
    }
};

// Update booking history when auth state changes
const originalUpdateUI = updateUI;
updateUI = function() {
    originalUpdateUI();
    updateBookingHistory();
};

// Initial booking history update
updateBookingHistory();

document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('payment-form');
    const bookingDetails = {
        bookingId: 'RBH2024031501',
        roomType: 'Deluxe Room',
        checkIn: '15 Mar 2024',
        checkOut: '17 Mar 2024',
        guests: '2 Adults',
        nights: '2',
        roomRate: '৳15,000',
        totalAmount: '৳30,000'
    };

    // Initialize form validation
    paymentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!paymentForm.checkValidity()) {
            event.stopPropagation();
            paymentForm.classList.add('was-validated');
            return;
        }

        // Collect payment data
        const paymentData = {
            cardName: document.getElementById('cc-name').value,
            cardNumber: document.getElementById('cc-number').value,
            expirationMonth: document.getElementById('cc-expiration-mm').value,
            expirationYear: document.getElementById('cc-expiration-yy').value,
            cvv: document.getElementById('cc-cvv').value,
            saveCard: document.getElementById('save-card').checked
        };

        // Process payment
        processPayment(paymentData);
    });

    // Format credit card number
    const ccNumber = document.getElementById('cc-number');
    ccNumber.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        
        // Format with spaces
        const parts = [];
        for (let i = 0; i < value.length; i += 4) {
            parts.push(value.slice(i, i + 4));
        }
        e.target.value = parts.join(' ');
    });

    // Format CVV
    const cvv = document.getElementById('cc-cvv');
    cvv.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        e.target.value = value;
    });

    // Process payment function
    function processPayment(paymentData) {
        // Show loading state
        const submitBtn = paymentForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';

        // Simulate payment processing
        setTimeout(() => {
            // Simulate successful payment
            showNotification('Payment successful! Your booking is confirmed.', 'success');
            
            // Reset form
            paymentForm.reset();
            paymentForm.classList.remove('was-validated');
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

            // Redirect to success page after 2 seconds
            setTimeout(() => {
                window.location.href = 'booking-success.html';
            }, 2000);
        }, 2000);
    }

    // Notification system
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification`;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        notification.style.animation = 'slideIn 0.5s ease-out';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Add notification animations to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Update booking details in the UI
    function updateBookingDetails() {
        for (const [key, value] of Object.entries(bookingDetails)) {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        }
    }

    // Initialize booking details
    updateBookingDetails();
}); 