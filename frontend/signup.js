document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:3000/api';
    const signupForm = document.querySelector('form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.querySelector('input[placeholder="Name"]').value;
            const email = document.querySelector('input[type="email"]').value;
            const phone = document.querySelector('input[type="tel"]').value;
            const password = document.querySelector('input[type="password"]').value;
            const confirmPassword = document.querySelector('input[placeholder="Confirm Password"]').value;

            // Validate password match
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        passWord: password
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Registration failed');
                }

                const data = await response.json();

                // Show success message
                alert('Registration successful! Please sign in.');

                // Redirect to sign in page
                window.location.href = 'signin.html';
            } catch (error) {
                console.error('Registration error:', error);
                alert(error.message || 'Registration failed. Please try again.');
            }
        });
    }
}); 