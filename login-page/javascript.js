// Google Sign-In Callback
function handleCredentialResponse(response) {
  // This gives you a JWT ID token. You can verify it on your server
  console.log("Google ID Token:", response.credential);

  // You could decode the JWT or send it to your backend here
  // For now, just alert the user
  alert("Google Sign-In successful!\nToken: " + response.credential);
}

// Handle Email/Password Login Form Submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent actual form submission

      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelector('input[type="password"]').value;

      // Placeholder logic — replace with actual authentication
      console.log("Email:", email);
      console.log("Password:", password);

      // You can send this data to your backend for verification
      alert(`Login attempt:\nEmail: ${email}\nPassword: ${password}`);
    });
  }
});
// Add this to javascript.js
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const toggle = document.querySelector(`[onclick="togglePassword('${inputId}')"]`);
  
  if (input.type === "password") {
    input.type = "text";
    toggle.textContent = "👁️‍🗨️"; // Crossed eye icon
  } else {
    input.type = "password";
    toggle.textContent = "👁️"; // Regular eye icon
  }
}