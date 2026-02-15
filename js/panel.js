// panel.js - Funcionalidad del panel

let currentEmail = '';
let fetchTimeout = null;
let timerInterval = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Obtener email del localStorage
    currentEmail = localStorage.getItem('netflixEmail');
    
    if (!currentEmail) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar email en el header
    document.getElementById('userEmail').textContent = currentEmail;
});

// Cambiar entre tabs
function switchTab(tabName) {
    // Actualizar botones de tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('tab-' + tabName).classList.add('active');
    
    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('content-' + tabName).classList.add('active');
}

// Reiniciar panel
function resetPanel() {
    localStorage.removeItem('netflixEmail');
    window.location.href = 'index.html';
}

// Buscar códigos (Modo Rápido)
async function fetchCodes() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const codesContainer = document.getElementById('codesContainer');
    
    // Mostrar loading
    loadingSpinner.style.display = 'flex';
    codesContainer.innerHTML = '';
    
    // Iniciar timer de 10 segundos
    let timeLeft = 10;
    const timerElement = document.getElementById('timer');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft + 's';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
    
    try {
        // Llamar a la API
        const response = await fetch('/api/check_emails.py?email=' + encodeURIComponent(currentEmail));
        const data = await response.json();
        
        clearInterval(timerInterval);
        loadingSpinner.style.display = 'none';
        
        if (data.success && data.codes && data.codes.length > 0) {
            displayCodes(data.codes);
            updateLastUpdate();
        } else {
            showNoCodesMessage();
        }
    } catch (error) {
        clearInterval(timerInterval);
        loadingSpinner.style.display = 'none';
        showErrorMessage(error.message);
    }
}

function displayCodes(codes) {
    const codesContainer = document.getElementById('codesContainer');
    codesContainer.innerHTML = '';
    
    codes.forEach(code => {
        const codeCard = document.createElement('div');
        codeCard.className = 'code-card';
        
        let content = `
            <h3>${code.subject}</h3>
            <p><strong>Para:</strong> ${code.to}</p>
            <p><strong>Recibido:</strong> ${code.date}</p>
        `;
        
        if (code.code) {
            content += `<div class="code-value">${code.code}</div>`;
        }
        
        if (code.link) {
            content += `<a href="${code.link}" class="code-link" target="_blank">🔗 Abrir enlace de verificación</a>`;
        }
        
        codeCard.innerHTML = content;
        codesContainer.appendChild(codeCard);
    });
}

function showNoCodesMessage() {
    const codesContainer = document.getElementById('codesContainer');
    codesContainer.innerHTML = `
        <div class="code-card" style="text-align: center; border-left-color: var(--netflix-yellow);">
            <h3>📭 No se encontraron códigos recientes</h3>
            <p>No hay correos de Netflix de los últimos 15 minutos.</p>
            <p style="margin-top: 15px;">💡 <strong>Sugerencias:</strong></p>
            <ul style="text-align: left; margin-top: 10px; color: var(--netflix-light-gray);">
                <li>Verifica que solicitaste el código desde Netflix</li>
                <li>El correo puede tardar unos segundos en llegar</li>
                <li>Asegúrate de usar el correo correcto: <strong>${currentEmail}</strong></li>
                <li>Prueba el <strong>Modo Guiado</strong> para instrucciones paso a paso</li>
            </ul>
        </div>
    `;
}

function showErrorMessage(message) {
    const codesContainer = document.getElementById('codesContainer');
    codesContainer.innerHTML = `
        <div class="code-card" style="text-align: center; border-left-color: #ff4444;">
            <h3>❌ Error al buscar códigos</h3>
            <p>${message}</p>
            <p style="margin-top: 15px;">Por favor, intenta nuevamente o contacta al soporte.</p>
        </div>
    `;
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('lastUpdate').textContent = `Última actualización: ${timeString}`;
}

function cancelFetch() {
    clearInterval(timerInterval);
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Modo Guiado
function showGuidedStep(stepType) {
    const guidedSteps = document.getElementById('guidedSteps');
    const optionsContainer = document.querySelector('.options-container');
    
    optionsContainer.style.display = 'none';
    guidedSteps.style.display = 'block';
    
    let content = '';
    
    switch(stepType) {
        case 'codigo-email':
            content = `
                <div class="step">
                    <h3>📺 Paso 1: Solicitar el código</h3>
                    <p>En la pantalla de tu TV verás un mensaje que dice <strong>"Ingresa el código que enviamos a tu email"</strong> con 4 cajas vacías.</p>
                    <p>Debajo de ese mensaje, presiona el botón <strong>"Enviar email"</strong> o <strong>"Solicitar código"</strong>.</p>
                </div>
                
                <div class="step">
                    <h3>📧 Paso 2: Espera unos segundos</h3>
                    <p>Netflix enviará un correo a: <strong>${currentEmail}</strong></p>
                    <p>El correo puede tardar entre 5-30 segundos en llegar.</p>
                </div>
                
                <div class="step">
                    <h3>🔍 Paso 3: Ver tu código aquí</h3>
                    <p>Cambia a la pestaña <strong>"Modo Rápido"</strong> y presiona <strong>"Actualizar códigos"</strong>.</p>
                    <p>Verás tu código de 4 dígitos que debes ingresar en tu TV.</p>
                </div>
                
                <div class="step">
                    <h3>⏰ Importante</h3>
                    <p>El código expira en <strong>15 minutos</strong>. Si pasa ese tiempo, deberás solicitar uno nuevo.</p>
                </div>
                
                <button class="btn-primary" onclick="switchToQuickMode()">🚀 Ir a Modo Rápido</button>
                <button class="btn-secondary" onclick="backToOptions()">← Volver</button>
            `;
            break;
            
        case 'tv-hogar':
            content = `
                <div class="step">
                    <h3>🏠 Paso 1: Selecciona una opción</h3>
                    <p>En tu TV verás dos opciones:</p>
                    <ul>
                        <li><strong>"Actualizar hogar Netflix"</strong> - Si esta es tu casa principal</li>
                        <li><strong>"Estoy de viaje"</strong> - Si estás temporalmente fuera de casa (recomendado)</li>
                    </ul>
                    <p>Selecciona la opción que prefieras.</p>
                </div>
                
                <div class="step">
                    <h3>📧 Paso 2: Enviar email</h3>
                    <p>Después de seleccionar, presiona <strong>"Enviar email"</strong>.</p>
                    <p>Netflix enviará un enlace a: <strong>${currentEmail}</strong></p>
                </div>
                
                <div class="step">
                    <h3>🔗 Paso 3: Obtener el enlace</h3>
                    <p>Ve al <strong>Modo Rápido</strong> y presiona <strong>"Actualizar códigos"</strong>.</p>
                    <p>Verás un enlace que debes abrir para confirmar.</p>
                </div>
                
                <button class="btn-primary" onclick="switchToQuickMode()">🚀 Ir a Modo Rápido</button>
                <button class="btn-secondary" onclick="backToOptions()">← Volver</button>
            `;
            break;
            
        case 'dispositivo-hogar':
            content = `
                <div class="step">
                    <h3>📱 Paso 1: Seleccionar "Ver temporalmente"</h3>
                    <p>En tu dispositivo móvil u otro dispositivo, verás el mensaje:</p>
                    <p><strong>"Tu dispositivo no forma parte del Hogar con Netflix"</strong></p>
                    <p>Presiona el botón <strong>"Ver temporalmente"</strong>.</p>
                </div>
                
                <div class="step">
                    <h3>📧 Paso 2: Solicitar código</h3>
                    <p>Te pedirá que solicites un código de verificación.</p>
                    <p>Presiona <strong>"Enviar email"</strong> o <strong>"Solicitar código"</strong>.</p>
                </div>
                
                <div class="step">
                    <h3>🔢 Paso 3: Ingresar el código</h3>
                    <p>El sistema te mostrará un código de 4 dígitos aquí en el <strong>Modo Rápido</strong>.</p>
                    <p>Ingresa ese código en tu dispositivo.</p>
                </div>
                
                <button class="btn-primary" onclick="switchToQuickMode()">🚀 Ir a Modo Rápido</button>
                <button class="btn-secondary" onclick="backToOptions()">← Volver</button>
            `;
            break;
            
        case 'sin-mensaje':
            content = `
                <div class="step">
                    <h3>❓ Ayuda General</h3>
                    <p>Si no ves ningún mensaje específico en tu dispositivo, sigue estos pasos:</p>
                </div>
                
                <div class="step">
                    <h3>1️⃣ Verifica tu cuenta</h3>
                    <p>Asegúrate de estar usando el correo correcto: <strong>${currentEmail}</strong></p>
                    <p>Si no es el correcto, presiona <strong>"Reiniciar"</strong> arriba.</p>
                </div>
                
                <div class="step">
                    <h3>2️⃣ Revisa tu conexión</h3>
                    <p>Verifica que tu dispositivo esté conectado a internet.</p>
                </div>
                
                <div class="step">
                    <h3>3️⃣ Reinicia Netflix</h3>
                    <p>Cierra completamente la app de Netflix y vuelve a abrirla.</p>
                </div>
                
                <div class="step">
                    <h3>4️⃣ Contacta soporte</h3>
                    <p>Si el problema persiste:</p>
                    <p>WhatsApp: <strong>+51 942 354 613</strong></p>
                    <p>Telegram: <strong>@Fyis2</strong></p>
                </div>
                
                <button class="btn-secondary" onclick="backToOptions()">← Volver</button>
            `;
            break;
    }
    
    guidedSteps.innerHTML = content;
}

function switchToQuickMode() {
    switchTab('rapido');
    window.scrollTo(0, 0);
}

function backToOptions() {
    const guidedSteps = document.getElementById('guidedSteps');
    const optionsContainer = document.querySelector('.options-container');
    
    guidedSteps.style.display = 'none';
    optionsContainer.style.display = 'grid';
}
