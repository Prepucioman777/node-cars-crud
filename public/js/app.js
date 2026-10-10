// ========================================================
// CARS (PIXAR) - LÓGICA DE GARAJE, TELEMETRÍA Y CRUD
// ========================================================

let productos = [];
let productoSeleccionadoParaEliminar = null;
let currentView = 'cards'; // 'cards' o 'table'

// Elementos DOM
const cardsViewContainer = document.getElementById('cardsViewContainer');
const tableViewContainer = document.getElementById('tableViewContainer');
const productosTableBody = document.getElementById('productosTableBody');
const resultCount = document.getElementById('resultCount');
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const categoriaFilter = document.getElementById('categoriaFilter');
const btnRefresh = document.getElementById('btnRefresh');
const btnNuevoProducto = document.getElementById('btnNuevoProducto');
const btnViewCards = document.getElementById('btnViewCards');
const btnViewTable = document.getElementById('btnViewTable');

// Stats DOM
const statTotalProductos = document.getElementById('statTotalProductos');
const statTotalStock = document.getElementById('statTotalStock');
const statVelocidadPromedio = document.getElementById('statVelocidadPromedio');
const statTotalCategorias = document.getElementById('statTotalCategorias');

// Status DOM
const dbStatusBadge = document.getElementById('dbStatusBadge');
const dbStatusDot = document.getElementById('dbStatusDot');
const dbStatusText = document.getElementById('dbStatusText');
const btnReconnect = document.getElementById('btnReconnect');
const infoPort = document.getElementById('infoPort');
const infoEngine = document.getElementById('infoEngine');
const infoUser = document.getElementById('infoUser');
const infoHost = document.getElementById('infoHost');

// Live DB Banner DOM
const liveDbCard = document.getElementById('liveDbCard');
const liveDbPing = document.getElementById('liveDbPing');
const liveDbDot = document.getElementById('liveDbDot');
const liveDbTitle = document.getElementById('liveDbTitle');
const liveDbBadge = document.getElementById('liveDbBadge');
const liveDbUser = document.getElementById('liveDbUser');
const liveDbSubtitle = document.getElementById('liveDbSubtitle');
const liveDbEngineText = document.getElementById('liveDbEngineText');
const btnBannerReconnect = document.getElementById('btnBannerReconnect');

// Modal Form DOM
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const btnModalClose = document.getElementById('btnModalClose');
const btnModalCancel = document.getElementById('btnModalCancel');
const productId = document.getElementById('productId');
const nombreInput = document.getElementById('nombreInput');
const categoriaInput = document.getElementById('categoriaInput');
const precioInput = document.getElementById('precioInput');
const stockInput = document.getElementById('stockInput');
const descripcionInput = document.getElementById('descripcionInput');

// Delete Modal DOM
const deleteModal = document.getElementById('deleteModal');
const deleteItemName = document.getElementById('deleteItemName');
const btnDeleteClose = document.getElementById('btnDeleteClose');
const btnDeleteCancel = document.getElementById('btnDeleteCancel');
const btnDeleteConfirm = document.getElementById('btnDeleteConfirm');

// Tacómetro e interactividad de motor
const btnStartEngines = document.getElementById('btnStartEngines');
const tachometerPanel = document.getElementById('tachometerPanel');
const rpmBar = document.getElementById('rpmBar');
const rpmText = document.getElementById('rpmText');

// ========================================================
// 🔊 SINTETIZADOR DE MOTOR V8 (Web Audio API nativo)
// ========================================================
function playEngineRevSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    
    // Oscilador 1: Ruido grave del motor V8 (Sawtooth)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    
    // Subida de revoluciones (ralentí 60Hz -> acelerón 280Hz -> ralentí)
    osc1.frequency.setValueAtTime(65, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.4);
    osc1.frequency.exponentialRampToValueAtTime(360, now + 0.7);
    osc1.frequency.exponentialRampToValueAtTime(70, now + 1.8);

    // Oscilador 2: Armónicos del escape
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(130, now);
    osc2.frequency.exponentialRampToValueAtTime(640, now + 0.4);
    osc2.frequency.exponentialRampToValueAtTime(140, now + 1.8);

    // Filtro pasa-bajos para darle cuerpo metálico
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.4);
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.8);

    // Envolvente de volumen
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gain1.gain.linearRampToValueAtTime(0.45, now + 0.5);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    gain2.gain.setValueAtTime(0.01, now);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

    // Conexión
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);
  } catch (e) {
    console.warn('AudioContext no soportado o bloqueado:', e);
  }
}

// Efecto visual de partículas y aceleración
function triggerEngineRevEffect() {
  playEngineRevSound();

  // Animación del tacómetro
  tachometerPanel.classList.add('engine-revving');
  rpmBar.style.width = '95%';
  rpmText.textContent = '8,500 RPM (¡Al corte!)';
  rpmText.className = 'font-racing text-xs text-racing-red animate-pulse';

  showToast('¡¡KA-CHOW!! ¡Motor V8 rugiendo en los Pits!', 'lightning');

  // Lanzar chispas / partículas visuales simples
  createSparkParticles(btnStartEngines);

  setTimeout(() => {
    rpmBar.style.width = '25%';
    rpmText.textContent = '1,200 RPM (Ralentí)';
    rpmText.className = 'font-racing text-xs text-highway-yellow';
    tachometerPanel.classList.remove('engine-revving');
  }, 1900);
}

function createSparkParticles(element) {
  const rect = element.getBoundingClientRect();
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'fixed rounded-full pointer-events-none z-50';
    const size = Math.random() * 8 + 4;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.backgroundColor = ['#FFCC00', '#E60012', '#FF6600', '#FFFFFF'][Math.floor(Math.random() * 4)];
    p.style.left = `${rect.left + rect.width / 2}px`;
    p.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 120 + 40;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    p.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
    ], {
      duration: 650,
      easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)'
    }).onfinish = () => p.remove();
  }
}

// Notificaciones Toast estilo Copa Pistón
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  let borderColor = 'border-highway-yellow';
  let icon = '🏁';
  if (type === 'success' || type === 'lightning') {
    borderColor = 'border-racing-red';
    icon = '⚡';
  } else if (type === 'error') {
    borderColor = 'border-red-600';
    icon = '⚠️';
  }

  toast.className = `toast-msg flex items-center gap-2.5 px-4 py-3 bg-asphalt border-l-4 ${borderColor} border-y border-r border-gray-700 text-white rounded-xl shadow-2xl text-xs font-semibold`;
  toast.innerHTML = `<span class="text-base">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 15);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Formato de velocidad
function formatSpeed(kmh) {
  return `${kmh} km/h`;
}

// Formato de fecha
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Consultar estado de la conexión a Oracle
async function checkDatabaseStatus() {
  try {
    const res = await fetch('/api/database/status');
    const data = await res.json();

    if (data.connected) {
      // Header Badge con efecto verde neón
      dbStatusBadge.className =
        'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-emerald-500/50 bg-emerald-950/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300';
      if (dbStatusDot) {
        dbStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]';
      }
      dbStatusText.textContent = `Oracle Conectado (${data.user || 'SYS'})`;

      // Live DB Card Banner en la parte superior
      if (liveDbCard) {
        liveDbCard.className =
          'bg-emerald-950/30 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-4 sm:px-6 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300';
      }
      if (liveDbPing) {
        liveDbPing.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75';
      }
      if (liveDbDot) {
        liveDbDot.className = 'relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_#10b981]';
      }
      if (liveDbTitle) {
        liveDbTitle.textContent = 'Conectado a Oracle Database';
        liveDbTitle.className = 'font-racing text-sm uppercase tracking-wider text-emerald-300';
      }
      if (liveDbBadge) {
        liveDbBadge.textContent = 'ONLINE';
        liveDbBadge.className =
          'px-2.5 py-0.5 rounded-full text-[10px] font-racing uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      }
      if (liveDbUser) {
        liveDbUser.textContent = `USER: ${data.user || 'SYS'}`;
        liveDbUser.className =
          'px-2 py-0.5 rounded text-[11px] font-mono bg-asphalt-dark text-emerald-300 border border-emerald-500/30 font-semibold';
      }
      if (liveDbSubtitle) {
        liveDbSubtitle.textContent = `${data.host}:${data.port}/${data.serviceName} • Red Docker: soc-net • Persistencia activa`;
      }
      if (liveDbEngineText) {
        liveDbEngineText.textContent = 'Oracle Database (gvenzl/oracle-free)';
        liveDbEngineText.className = 'font-semibold text-emerald-400 font-mono text-xs';
      }

      // Panel Pits Técnicos
      if (infoEngine) {
        infoEngine.textContent = 'Oracle Database (Contenedor / soc-net)';
        infoEngine.className = 'text-emerald-400 font-semibold ml-1';
      }
      if (infoUser) {
        infoUser.textContent = data.user || 'SYS';
        infoUser.className = 'text-emerald-400 font-mono ml-1 font-semibold';
      }
    } else {
      // Header Badge (Modo local de contingencia)
      dbStatusBadge.className =
        'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 transition-all duration-300';
      if (dbStatusDot) {
        dbStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse';
      }
      dbStatusText.textContent = 'Modo Garaje Local (Memoria)';

      // Live DB Card Banner
      if (liveDbCard) {
        liveDbCard.className =
          'bg-yellow-950/20 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300';
      }
      if (liveDbPing) {
        liveDbPing.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75';
      }
      if (liveDbDot) {
        liveDbDot.className = 'relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-500';
      }
      if (liveDbTitle) {
        liveDbTitle.textContent = 'Modo Memoria Local (Esperando Oracle)';
        liveDbTitle.className = 'font-racing text-sm uppercase tracking-wider text-yellow-300';
      }
      if (liveDbBadge) {
        liveDbBadge.textContent = 'STANDBY';
        liveDbBadge.className =
          'px-2.5 py-0.5 rounded-full text-[10px] font-racing uppercase tracking-widest bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
      }
      if (liveDbUser) {
        liveDbUser.textContent = `USER: ${data.user || 'Desconectado'}`;
        liveDbUser.className =
          'px-2 py-0.5 rounded text-[11px] font-mono bg-asphalt-dark text-yellow-300 border border-yellow-500/30';
      }
      if (liveDbSubtitle) {
        liveDbSubtitle.textContent = 'Esperando contenedor oracle-db en soc-net... (Modo contingencia en memoria)';
      }
      if (liveDbEngineText) {
        liveDbEngineText.textContent = 'Memoria Local (Fallback)';
        liveDbEngineText.className = 'font-semibold text-yellow-400 font-mono text-xs';
      }

      // Panel Pits Técnicos
      if (infoEngine) {
        infoEngine.textContent = 'Memoria Local (Esperando Oracle DB)';
        infoEngine.className = 'text-yellow-400 font-semibold ml-1';
      }
      if (infoUser) {
        infoUser.textContent = data.user || 'SYS';
        infoUser.className = 'text-yellow-400 font-mono ml-1 font-semibold';
      }
    }

    if (infoHost) infoHost.textContent = `${data.host}:${data.port}/${data.serviceName}`;
  } catch (err) {
    dbStatusBadge.className =
      'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-red-500/40 bg-red-500/10 text-red-300';
    if (dbStatusDot) dbStatusDot.className = 'w-2.5 h-2.5 rounded-full bg-red-500';
    dbStatusText.textContent = 'Falla de Telemetría (Error)';
  }
}

// Reintentar conexión con Oracle
async function handleReconnect() {
  btnReconnect.disabled = true;
  btnReconnect.textContent = '⏳ Conectando...';
  try {
    const res = await fetch('/api/database/reconnect', { method: 'POST' });
    const data = await res.json();
    if (data.connected) {
      showToast('¡Telemetría establecida con Oracle Database!', 'success');
    } else {
      showToast('Oracle no respondió aún. Continuando en modo local.', 'info');
    }
    await checkDatabaseStatus();
    await loadProducts();
  } catch (err) {
    showToast('Error al intentar contactar con Oracle', 'error');
  } finally {
    btnReconnect.disabled = false;
    btnReconnect.textContent = '⚡ Reconectar';
  }
}

// Cargar bólidos desde la API
async function loadProducts() {
  const search = searchInput.value.trim();
  const categoria = categoriaFilter.value.trim();

  let url = '/api/productos?';
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (categoria) url += `categoria=${encodeURIComponent(categoria)}&`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error en la respuesta del servidor');
    productos = await res.json();
    renderViews();
    updateStats();
  } catch (err) {
    showToast('Error al cargar la parrilla de bólidos', 'error');
    cardsViewContainer.innerHTML = `
      <div class="col-span-full py-16 text-center text-gray-400">
        <p class="text-4xl mb-3">⚠️</p>
        <p class="font-racing text-lg text-white">No se pudo conectar a los Pits.</p>
      </div>
    `;
  }
}

// Actualizar métricas del garaje
function updateStats() {
  const total = productos.length;
  const totalStock = productos.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const velPromedio = total > 0
    ? Math.round(productos.reduce((sum, p) => sum + (Number(p.precio) || 0), 0) / total)
    : 0;
  const categoriasUnicas = new Set(productos.map((p) => p.categoria.trim())).size;

  statTotalProductos.textContent = total;
  statTotalStock.textContent = totalStock;
  statVelocidadPromedio.textContent = `${velPromedio} km/h`;
  statTotalCategorias.textContent = categoriasUnicas;
  resultCount.textContent = `${total} bólido${total === 1 ? '' : 's'} en parrilla`;
}

// Determinar el estilo de tarjeta según el personaje
function getCarThemeClass(nombre) {
  const n = (nombre || '').toLowerCase();
  if (n.includes('mcqueen') || n.includes('95')) return 'car-card-mcqueen border-racing-red/50';
  if (n.includes('rey') || n.includes('dinoco') || n.includes('43')) return 'car-card-dinoco border-dinoco-blue/50';
  if (n.includes('hudson') || n.includes('doc') || n.includes('51')) return 'car-card-hudson border-indigo-500/50';
  if (n.includes('mate') || n.includes('mater')) return 'car-card-mater border-amber-600/50';
  return 'border-gray-800';
}

function getCarIcon(nombre) {
  const n = (nombre || '').toLowerCase();
  if (n.includes('mate')) return '🛻';
  if (n.includes('sally')) return '🏎️';
  if (n.includes('hudson')) return '🚘';
  if (n.includes('rey')) return '👑';
  return '🏎️';
}

// Renderizar Vistas (Tarjetas y Tabla)
function renderViews() {
  if (productos.length === 0) {
    const emptyHtml = `
      <div class="col-span-full py-16 text-center text-gray-400 bg-asphalt rounded-2xl border border-gray-800">
        <p class="text-4xl mb-2">🏁</p>
        <p class="font-racing text-lg text-white">No hay bólidos en la pista con este criterio.</p>
        <p class="text-xs text-gray-500 mt-1">Prueba agregando uno nuevo o cambiando el filtro.</p>
      </div>
    `;
    cardsViewContainer.innerHTML = emptyHtml;
    productosTableBody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-gray-400">Sin bólidos registrados</td></tr>`;
    return;
  }

  // 1. Renderizar Tarjetas Ficha Técnica
  cardsViewContainer.innerHTML = productos.map((p) => {
    const cardBorder = getCarThemeClass(p.nombre);
    const icon = getCarIcon(p.nombre);
    const speedPercent = Math.min(100, Math.round((Number(p.precio) / 360) * 100));

    return `
      <div class="car-card bg-asphalt rounded-2xl border-2 ${cardBorder} p-6 shadow-xl flex flex-col justify-between">
        
        <div>
          <!-- Cabecera de Ficha Técnica -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-3xl">${icon}</span>
              <div>
                <span class="text-[10px] font-racing text-gray-500 uppercase tracking-widest">Bólido #${p.id}</span>
                <h3 class="font-racing text-lg text-white tracking-wide">${escapeHtml(p.nombre)}</h3>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-md text-[10px] font-racing uppercase tracking-wider bg-asphalt-dark text-highway-yellow border border-highway-yellow/30">
              ${escapeHtml(p.categoria)}
            </span>
          </div>

          <!-- Barra de Velocidad Máxima -->
          <div class="bg-asphalt-dark p-3 rounded-xl border border-gray-800 my-3">
            <div class="flex justify-between text-xs font-racing mb-1.5">
              <span class="text-gray-400 uppercase">Velocidad Punta:</span>
              <span class="text-highway-yellow font-bold">${formatSpeed(p.precio)}</span>
            </div>
            <div class="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div class="bg-gradient-to-r from-highway-yellow via-sunset-orange to-racing-red h-full rounded-full transition-all duration-500" style="width: ${speedPercent}%;"></div>
            </div>
          </div>

          <!-- Frase Célebre o Descripción -->
          <p class="text-xs text-gray-300 italic bg-asphalt-dark/50 p-3 rounded-xl border border-gray-800/80 leading-relaxed mb-4">
            ${escapeHtml(p.descripcion) || 'Sin notas de telemetría en los pits.'}
          </p>
        </div>

        <!-- Pie de Ficha: Stock y Acciones -->
        <div class="pt-4 border-t border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs">
            <span class="text-gray-400">Chasis:</span>
            <span class="font-racing text-white bg-asphalt-dark px-2 py-0.5 rounded border border-gray-700">${p.stock} unid.</span>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="openEditModal(${p.id})" class="px-3 py-1.5 rounded-lg text-xs font-racing uppercase tracking-wider text-highway-yellow bg-asphalt-dark hover:bg-yellow-500/10 border border-highway-yellow/40 transition-colors" title="Afinar / Editar">
              🔧 Afinar
            </button>
            <button onclick="openDeleteModal(${p.id})" class="px-3 py-1.5 rounded-lg text-xs font-racing uppercase tracking-wider text-racing-red bg-asphalt-dark hover:bg-red-500/10 border border-racing-red/40 transition-colors" title="Retirar">
              🏁 Retirar
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');

  // 2. Renderizar Tabla Técnica
  productosTableBody.innerHTML = productos.map((p) => `
    <tr class="hover:bg-asphalt-light/40 transition-colors">
      <td class="py-3 px-4 font-racing text-highway-yellow">#${p.id}</td>
      <td class="py-3 px-4">
        <span class="font-racing text-white">${escapeHtml(p.nombre)}</span>
        <span class="block text-[11px] text-gray-400 truncate max-w-xs">${escapeHtml(p.descripcion)}</span>
      </td>
      <td class="py-3 px-4">
        <span class="text-xs font-racing px-2 py-0.5 rounded bg-asphalt-dark border border-gray-700 text-gray-300">${escapeHtml(p.categoria)}</span>
      </td>
      <td class="py-3 px-4 font-racing text-highway-yellow">${formatSpeed(p.precio)}</td>
      <td class="py-3 px-4 font-semibold text-xs text-white">${p.stock} unid.</td>
      <td class="py-3 px-4 text-xs text-gray-400">${formatDate(p.creadoEn)}</td>
      <td class="py-3 px-4 text-center">
        <div class="flex items-center justify-center gap-2">
          <button onclick="openEditModal(${p.id})" class="px-2.5 py-1 bg-asphalt-dark text-highway-yellow hover:bg-yellow-500/10 border border-highway-yellow/30 rounded text-xs font-racing">Editar</button>
          <button onclick="openDeleteModal(${p.id})" class="px-2.5 py-1 bg-asphalt-dark text-racing-red hover:bg-red-500/10 border border-racing-red/30 rounded text-xs font-racing">Borrar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Modal Crear / Editar
function openCreateModal() {
  modalTitle.textContent = 'Nuevo Bólido de Carreras';
  productId.value = '';
  productForm.reset();
  productModal.classList.add('modal-active');
  nombreInput.focus();
}

window.openEditModal = function (id) {
  const p = productos.find((item) => item.id === id);
  if (!p) return;

  modalTitle.textContent = 'Poner a Punto ' + p.nombre;
  productId.value = p.id;
  nombreInput.value = p.nombre;
  categoriaInput.value = p.categoria;
  precioInput.value = p.precio;
  stockInput.value = p.stock;
  descripcionInput.value = p.descripcion || '';

  productModal.classList.add('modal-active');
  nombreInput.focus();
};

function closeProductModal() {
  productModal.classList.remove('modal-active');
}

// Modal Eliminar
window.openDeleteModal = function (id) {
  const p = productos.find((item) => item.id === id);
  if (!p) return;
  productoSeleccionadoParaEliminar = p;
  deleteItemName.textContent = `"${p.nombre}" (ID: #${p.id})`;
  deleteModal.classList.add('modal-active');
};

function closeDeleteModal() {
  deleteModal.classList.remove('modal-active');
  productoSeleccionadoParaEliminar = null;
}

// Guardar formulario (Crear o Actualizar)
async function handleFormSubmit(e) {
  e.preventDefault();

  const id = productId.value;
  const isEditing = Boolean(id);

  const payload = {
    nombre: nombreInput.value.trim(),
    categoria: categoriaInput.value.trim(),
    precio: Number(precioInput.value),
    stock: Number(stockInput.value),
    descripcion: descripcionInput.value.trim(),
  };

  try {
    const url = isEditing ? `/api/productos/${id}` : '/api/productos';
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg = Array.isArray(errData.message)
        ? errData.message.join(', ')
        : errData.message || 'Error en los Pits al guardar';
      throw new Error(msg);
    }

    showToast(
      isEditing ? '¡Bólido afinado y listo para correr!' : '¡Nuevo bólido registrado en la parrilla!',
      'success',
    );
    closeProductModal();
    await loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Confirmar retiro (DELETE)
async function handleConfirmDelete() {
  if (!productoSeleccionadoParaEliminar) return;

  const id = productoSeleccionadoParaEliminar.id;
  btnDeleteConfirm.disabled = true;

  try {
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No se pudo retirar el bólido');

    showToast('Bólido retirado con bandera negra', 'lightning');
    closeDeleteModal();
    await loadProducts();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btnDeleteConfirm.disabled = false;
  }
}

// Cambiar entre Vista Tarjetas y Vista Tabla
if (btnViewCards) {
  btnViewCards.addEventListener('click', () => {
    currentView = 'cards';
    cardsViewContainer.classList.remove('hidden');
    tableViewContainer.classList.add('hidden');
    btnViewCards.className = 'px-3 py-1.5 rounded-lg text-xs font-racing uppercase tracking-wider bg-racing-red text-white transition-all';
    btnViewTable.className = 'px-3 py-1.5 rounded-lg text-xs font-racing uppercase tracking-wider text-gray-400 hover:text-white transition-all';
  });
}

if (btnViewTable) {
  btnViewTable.addEventListener('click', () => {
    currentView = 'table';
    cardsViewContainer.classList.add('hidden');
    tableViewContainer.classList.remove('hidden');
    btnViewTable.className = 'px-3 py-1.5 rounded-lg text-xs font-racing uppercase tracking-wider bg-racing-red text-white transition-all';
    btnViewCards.className = 'px-3 py-1.5 rounded-lg text-xs font-racing uppercase tracking-wider text-gray-400 hover:text-white transition-all';
  });
}

// Event Listeners seguros
if (btnStartEngines) btnStartEngines.addEventListener('click', triggerEngineRevEffect);
if (btnNuevoProducto) btnNuevoProducto.addEventListener('click', openCreateModal);
if (btnModalClose) btnModalClose.addEventListener('click', closeProductModal);
if (btnModalCancel) btnModalCancel.addEventListener('click', closeProductModal);
if (productForm) productForm.addEventListener('submit', handleFormSubmit);

if (btnDeleteClose) btnDeleteClose.addEventListener('click', closeDeleteModal);
if (btnDeleteCancel) btnDeleteCancel.addEventListener('click', closeDeleteModal);
if (btnDeleteConfirm) btnDeleteConfirm.addEventListener('click', handleConfirmDelete);

if (btnRefresh) {
  btnRefresh.addEventListener('click', () => {
    loadProducts();
    checkDatabaseStatus();
    showToast('Garaje sincronizado', 'info');
  });
}

if (btnReconnect) btnReconnect.addEventListener('click', handleReconnect);
if (btnBannerReconnect) {
  btnBannerReconnect.addEventListener('click', handleReconnect);
}

// Búsqueda en tiempo real con debounce
let debounceTimer;
if (searchInput) {
  searchInput.addEventListener('input', () => {
    if (btnClearSearch) btnClearSearch.style.display = searchInput.value ? 'block' : 'none';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadProducts();
    }, 250);
  });
}

if (btnClearSearch) {
  btnClearSearch.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    btnClearSearch.style.display = 'none';
    loadProducts();
  });
}

if (categoriaFilter) {
  categoriaFilter.addEventListener('change', () => {
    loadProducts();
  });
}

// Cerrar modales con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductModal();
    closeDeleteModal();
  }
});

// Inicialización inmediata y garantizada al cargar la página
function initApp() {
  checkDatabaseStatus();
  loadProducts();
  setInterval(checkDatabaseStatus, 15000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // Si el navegador ya parseó el DOM (por estar al final del body)
  initApp();
}
