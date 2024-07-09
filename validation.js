document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    const ageCheckbox = document.getElementById('age');
    const tosCheckbox = document.getElementById('tos');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        let valid = true;

        // Username validation
        if (!/^[a-zA-Z][a-zA-Z0-9]{2,}$/.test(username.value)) {
            valid = false;
            alert('Username must start with a letter and be at least 3 characters long.');
        }

        // Password validation
        if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[/*\-+!@#$^&~[\]]).{8,}$/.test(password.value)) {
            valid = false;
            alert('Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.');
        }

        // Confirm password validation
        if (password.value !== confirmPassword.value) {
            valid = false;
            alert('Passwords do not match.');
        }

        // Email validation
        if (!email.validity.valid) {
            valid = false;
            alert('Please enter a valid email address.');
        }

        // Age validation
        if (!ageCheckbox.checked) {
            valid = false;
            alert('You must confirm that you are 13+ years of age.');
        }

        // TOS validation
        if (!tosCheckbox.checked) {
            valid = false;
            alert('You must accept the Terms of Service and Privacy rules.');
        }

        if (valid) {
            alert('Form submitted successfully!');
            form.submit();
        }
    });
});
