document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const alertContainer = document.getElementById('alertContainer');
    const passwordInput = document.getElementById('password');

    document.querySelectorAll('.toggle-password').forEach(function (icon) {
        icon.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            if (!targetInput) return;

            const isPassword = targetInput.type === 'password';
            targetInput.type = isPassword ? 'text' : 'password';
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value.trim();

        alertContainer.className = 'alert d-none';

        if (!email || !password) {
            showAlert('Please enter both email and password.', 'danger');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Signing in...';

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email, password })
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok) {
                        throw new Error(data.message || 'Unable to sign in.');
                    }
                    return data;
                });
            })
            .then(function (data) {
                showAlert(data.message || 'Login successful!', 'success');
                // Redirect to landing page after successful login
                setTimeout(function () {
                    window.location.href = data.redirect || '/';
                }, 800);
            })
            .catch(function (error) {
                showAlert(error.message || 'Unable to sign in. Please try again.', 'danger');
            })
            .finally(function () {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Login <i class="fas fa-arrow-right ms-1"></i>';
            });
    });

    function showAlert(message, type) {
        alertContainer.className = `alert alert-${type}`;
        alertContainer.textContent = message;
    }
});
