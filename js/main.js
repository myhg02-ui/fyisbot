// main.js - Página de inicio

function goToPanel() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('⚠️ Por favor ingresa tu correo de Netflix');
        emailInput.focus();
        return;
    }
    
    if (!validateEmail(email)) {
        alert('⚠️ Por favor ingresa un correo válido');
        emailInput.focus();
        return;
    }
    
    // Guardar email en localStorage
    localStorage.setItem('netflixEmail', email);
    
    // Redirigir al panel
    window.location.href = 'panel.html';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Permitir enviar con Enter
document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                goToPanel();
            }
        });
    }
});
