// DOM elements
const personajesEl = document.getElementById('personajes');
const casasEl = document.getElementById('casas');
const librosEl = document.getElementById('libros');
const favoritosEl = document.getElementById('favoritos');
const searchInput = document.getElementById('search');
const resultadoRuleta = document.getElementById('resultadoRuleta');

// Botones
const btnPersonajes = document.getElementById('btnPersonajes');
const btnCasas = document.getElementById('btnCasas');
const btnFavoritos = document.getElementById('btnFavoritos');
const btnRegistro = document.getElementById('btnRegistro');
const ruletaPersonaje = document.getElementById('ruletaPersonaje');
const ruletaCasa = document.getElementById('ruletaCasa');

// Variables globales
let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
let personajesData = [];
let casasData = [];

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((registration) => {
        console.log('SW registrado con éxito: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW falló al registrarse: ', registrationError);
      });
  });
}

function showSection(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  // Actualizar el estado activo de los botones del menú
  document.querySelectorAll('.bottom-menu button').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn${id.charAt(0).toUpperCase() + id.slice(1)}`).classList.add('active');
}

function crearCard(item, esFavorito = false) {
  const div = document.createElement('div');
  div.className = 'card';

  div.innerHTML = `
    <img src="${item.imageUrl || 'https://via.placeholder.com/250x350?text=Sin+imagen'}" alt="${item.fullName || item.name}" loading="lazy">
    <h3>${item.fullName || item.name}</h3>
    ${item.title ? `<p>${item.title}</p>` : ''}
    ${item.family ? `<p><strong>Casa:</strong> ${item.family}</p>` : ''}
    <button class="fav">${esFavorito ? '❌ Eliminar' : '⭐ Favorito'}</button>
  `;

  div.querySelector('button').onclick = () => {
    if (esFavorito) {
      favoritos = favoritos.filter(f => f.id !== item.id);
    } else if (!favoritos.find(f => f.id === item.id)) {
      favoritos.push(item);
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    cargarFavoritos();
    
    // Mostrar mensaje de confirmación
    mostrarMensaje(esFavorito ? 'Eliminado de favoritos' : 'Añadido a favoritos');
  };

  return div;
}

function mostrarMensaje(mensaje) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1001;
  `;
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 2000);
}

function cargarFavoritos() {
  favoritosEl.innerHTML = '<h2>Favoritos</h2>';
  
  if (favoritos.length === 0) {
    favoritosEl.innerHTML += '<p class="loading">No tienes favoritos guardados</p>';
    return;
  }
  
  favoritos.forEach(f => {
    const card = crearCard(f, true);
    favoritosEl.appendChild(card);
  });
}

async function cargarPersonajes() {
  personajesEl.innerHTML = '<div class="loading">Cargando personajes...</div>';
  
  try {
    const res = await fetch('https://thronesapi.com/api/v2/Characters');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    personajesData = data;
    
    personajesEl.innerHTML = '<h2>Personajes</h2>';
    data.forEach(p => {
      const card = crearCard(p);
      personajesEl.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar personajes:', error);
    personajesEl.innerHTML = '<div class="error">Error al cargar personajes. Por favor, verifica tu conexión a internet.</div>';
  }
}

async function cargarCasas() {
  casasEl.innerHTML = '<div class="loading">Cargando casas...</div>';
  
  try {
    // Si ya tenemos los datos de personajes, usarlos
    let data = personajesData;
    
    if (data.length === 0) {
      const res = await fetch('https://thronesapi.com/api/v2/Characters');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      data = await res.json();
    }
    
    const casasUnicas = [...new Set(data.map(c => c.family).filter(Boolean))];
    casasData = casasUnicas.map((casa, i) => ({
      id: `casa-${i}`,
      name: casa,
      imageUrl: 'https://via.placeholder.com/250x350?text=' + encodeURIComponent(casa)
    }));
    
    casasEl.innerHTML = '<h2>Casas</h2>';
    casasData.forEach(casa => {
      const card = crearCard(casa);
      casasEl.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar casas:', error);
    casasEl.innerHTML = '<div class="error">Error al cargar casas. Por favor, verifica tu conexión a internet.</div>';
  }
}

function cargarLibros() {
  librosEl.innerHTML = '<h2>Libros</h2>';
  const libros = [
    { 
      id: 1, 
      name: "Juego de Tronos", 
      imageUrl: "https://m.media-amazon.com/images/I/91JgkRAqNEL.jpg" 
    },
    { 
      id: 2, 
      name: "Choque de Reyes", 
      imageUrl: "https://m.media-amazon.com/images/I/81ndLw7ZVXL.jpg" 
    },
    { 
      id: 3, 
      name: "Tormenta de Espadas", 
      imageUrl: "https://m.media-amazon.com/images/I/91GGDFXNGhL.jpg" 
    },
    { 
      id: 4, 
      name: "Festín de Cuervos", 
      imageUrl: "https://via.placeholder.com/250x350?text=Festín+de+Cuervos" 
    },
    { 
      id: 5, 
      name: "Danza de Dragones", 
      imageUrl: "https://via.placeholder.com/250x350?text=Danza+de+Dragones" 
    }
  ];
  
  libros.forEach(libro => {
    const card = crearCard(libro);
    librosEl.appendChild(card);
  });
}

async function girarRuleta(tipo) {
  resultadoRuleta.innerHTML = '<div class="loading">Girando la ruleta...</div>';
  
  try {
    let item;
    
    if (tipo === 'characters') {
      if (personajesData.length === 0) {
        const res = await fetch('https://thronesapi.com/api/v2/Characters');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        personajesData = await res.json();
      }
      item = personajesData[Math.floor(Math.random() * personajesData.length)];
    } else {
      if (casasData.length === 0) {
        await cargarCasas();
      }
      item = casasData[Math.floor(Math.random() * casasData.length)];
    }

    resultadoRuleta.innerHTML = '<h3>¡Resultado de la ruleta!</h3>';
    const card = crearCard(item);
    resultadoRuleta.appendChild(card);

  } catch (error) {
    console.error('Error al girar la ruleta:', error);
    resultadoRuleta.innerHTML = '<div class="error">Error al girar la ruleta. Por favor, verifica tu conexión a internet.</div>';
  }
}

// Event Listeners
document.getElementById('registroForm')?.addEventListener('submit', e => {
  e.preventDefault();
  mostrarMensaje('Registro exitoso');
  e.target.reset();
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('.page.active .card').forEach(el => {
    const text = el.textContent.toLowerCase();
    el.style.display = text.includes(query) ? '' : 'none';
  });
});

// Eventos para los botones del menú
btnPersonajes.addEventListener('click', () => showSection('personajes'));
btnCasas.addEventListener('click', () => showSection('casas'));
btnFavoritos.addEventListener('click', () => showSection('favoritos'));
btnRegistro.addEventListener('click', () => showSection('registro'));

// Eventos para la ruleta
ruletaPersonaje?.addEventListener('click', () => girarRuleta('characters'));
ruletaCasa?.addEventListener('click', () => girarRuleta('houses'));

// Función de inicialización
async function init() {
  try {
    await Promise.all([
      cargarPersonajes(),
      cargarCasas(),
      cargarLibros()
    ]);
    cargarFavoritos();
    showSection('personajes');
  } catch (error) {
    console.error('Error en la inicialización:', error);
  }
}

// Inicializar la aplicación
init();