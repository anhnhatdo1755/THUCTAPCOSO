document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:3000/api';
    const signinForm = document.getElementById('loginForm');

    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.querySelector('input[type="email"]').value;
            const password = document.querySelector('input[type="password"]').value;

            console.log('Attempting login with:', { email, password });

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        passWord: password
                    })
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // Save token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on user role
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'homepage.html';
                }
            } catch (error) {
                console.error('Login error:', error);
                alert(error.message || 'Login failed. Please try again.');
            }
        });
    }
});
