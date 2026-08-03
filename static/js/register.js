document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const mobile = document.getElementById('mobileNumber').value.trim();
        const ageEl = document.getElementById('userAge');
        const age = ageEl ? ageEl.value.trim() : '21';
        const roleEl = document.getElementById('role');
        const role = roleEl ? roleEl.value : 'Student';
        const password = document.getElementById('password').value.trim();
        const password2 = document.getElementById('confirmPassword').value.trim();
        const agree = document.getElementById('agreeTerms').checked;

        if (!email || !password) {
            return alert('Email and password are required.');
        }
        if (password !== password2) {
            return alert('Passwords do not match.');
        }
        if (!agree) {
            return alert('You must agree to the terms to create an account.');
        }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Creating...';

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ full_name: fullName, email, mobile, age, role, password, password2 })
        })
            .then(async (response) => {
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.message || 'Registration failed');
                alert(data.message || 'Account created.');
                window.location.href = data.redirect || '/';
            })
            .catch((err) => {
                alert(err.message || 'Unable to create account.');
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            });
    });
});
