/* ═══════════════════════════════════════════════════════════════════
   app.js — Mock Data e Interactividad (sin fetch, todo embebido)
   ═══════════════════════════════════════════════════════════════════ */

/* ── Mock Data ── */

const PRODUCTOS = [
  { codigo: 'PRO-001', nombre: 'Arroz Grado 1 1kg', categoria: 'abarrotes', stock: 240, stockMin: 30, precio: 1290 },
  { codigo: 'PRO-002', nombre: 'Aceite Vegetal 1L', categoria: 'abarrotes', stock: 180, stockMin: 20, precio: 2490 },
  { codigo: 'PRO-003', nombre: 'Leche Entera 1L', categoria: 'lacteos', stock: 320, stockMin: 40, precio: 1090 },
  { codigo: 'PRO-004', nombre: 'Queso Gauda 500g', categoria: 'lacteos', stock: 45, stockMin: 15, precio: 3990 },
  { codigo: 'PRO-005', nombre: 'Pan Blanco 800g', categoria: 'abarrotes', stock: 6, stockMin: 20, precio: 1890 },
  { codigo: 'PRO-006', nombre: 'Bebida Cola 1.5L', categoria: 'bebidas', stock: 200, stockMin: 30, precio: 1590 },
  { codigo: 'PRO-007', nombre: 'Agua Mineral 1.5L', categoria: 'bebidas', stock: 150, stockMin: 25, precio: 890 },
  { codigo: 'PRO-008', nombre: 'Detergente Líquido 1L', categoria: 'limpieza', stock: 9, stockMin: 15, precio: 3290 },
  { codigo: 'PRO-009', nombre: 'Lavaloza 750ml', categoria: 'limpieza', stock: 65, stockMin: 20, precio: 2190 },
  { codigo: 'PRO-010', nombre: 'Papel Higiénico 8rollos', categoria: 'limpieza', stock: 3, stockMin: 25, precio: 4590 },
  { codigo: 'PRO-011', nombre: 'Tallarines 500g', categoria: 'abarrotes', stock: 190, stockMin: 30, precio: 890 },
  { codigo: 'PRO-012', nombre: 'Arroz Integral 1kg', categoria: 'abarrotes', stock: 85, stockMin: 15, precio: 1590 },
  { codigo: 'PRO-013', nombre: 'Atún Enlatado 80g', categoria: 'abarrotes', stock: 12, stockMin: 25, precio: 1490 },
  { codigo: 'PRO-014', nombre: 'Mantequilla 250g', categoria: 'lacteos', stock: 55, stockMin: 15, precio: 2590 },
  { codigo: 'PRO-015', nombre: 'Bebida Naranja 2L', categoria: 'bebidas', stock: 110, stockMin: 20, precio: 1790 },
  { codigo: 'PRO-016', nombre: 'Cerveza Lager 6pack', categoria: 'bebidas', stock: 75, stockMin: 15, precio: 6990 },
  { codigo: 'PRO-017', nombre: 'Harina 1kg', categoria: 'abarrotes', stock: 130, stockMin: 25, precio: 1190 },
  { codigo: 'PRO-018', nombre: 'Azúcar 1kg', categoria: 'abarrotes', stock: 4, stockMin: 20, precio: 1390 },
  { codigo: 'PRO-019', nombre: 'Café Molido 250g', categoria: 'abarrotes', stock: 60, stockMin: 15, precio: 3990 },
  { codigo: 'PRO-020', nombre: 'Cloro 1L', categoria: 'limpieza', stock: 95, stockMin: 20, precio: 1490 },
];

const USUARIOS = [
  { nombre: 'Juan Pérez', email: 'juan@distribuidora.cl', rol: 'admin', estado: 'activo', creado: '2024-01-15' },
  { nombre: 'María González', email: 'maria@distribuidora.cl', rol: 'vendedor', estado: 'activo', creado: '2024-02-01' },
  { nombre: 'Carlos Muñoz', email: 'carlos@distribuidora.cl', rol: 'vendedor', estado: 'activo', creado: '2024-03-10' },
  { nombre: 'Ana Soto', email: 'ana@distribuidora.cl', rol: 'vendedor', estado: 'inactivo', creado: '2024-03-15' },
  { nombre: 'Pedro Ramírez', email: 'pedro@distribuidora.cl', rol: 'admin', estado: 'activo', creado: '2024-04-20' },
  { nombre: 'Laura Díaz', email: 'laura@distribuidora.cl', rol: 'vendedor', estado: 'activo', creado: '2024-05-05' },
  { nombre: 'Diego Torres', email: 'diego@distribuidora.cl', rol: 'vendedor', estado: 'inactivo', creado: '2024-06-01' },
  { nombre: 'Valentina Castro', email: 'valentina@distribuidora.cl', rol: 'vendedor', estado: 'activo', creado: '2024-06-15' },
];

const VENTAS = [
  { folio: 'FAC-001', cliente: 'Almacén El Centro', rut: '77.123.456-7', total: 125400, tipo: 'factura', fecha: '2024-07-17' },
  { folio: 'BLE-001', cliente: 'Particular', rut: '—', total: 23450, tipo: 'boleta', fecha: '2024-07-17' },
  { folio: 'FAC-002', cliente: 'Distribuidora Norte', rut: '76.987.654-3', total: 567800, tipo: 'factura', fecha: '2024-07-16' },
  { folio: 'BLE-002', cliente: 'Particular', rut: '—', total: 18990, tipo: 'boleta', fecha: '2024-07-16' },
  { folio: 'FAC-003', cliente: 'Supermercado San Pablo', rut: '78.456.123-0', total: 345600, tipo: 'factura', fecha: '2024-07-15' },
  { folio: 'BLE-003', cliente: 'Particular', rut: '—', total: 8900, tipo: 'boleta', fecha: '2024-07-15' },
  { folio: 'FAC-004', cliente: 'Minimarket Express', rut: '75.321.678-4', total: 78900, tipo: 'factura', fecha: '2024-07-14' },
  { folio: 'BLE-004', cliente: 'Particular', rut: '—', total: 34500, tipo: 'boleta', fecha: '2024-07-14' },
];

/* ── Formateo CLP ── */
function formatCLP(n) {
  return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ═══════════════════════════════════════════════════════════════════
   HTML embebido (para evitar fetch en file://)
   ═══════════════════════════════════════════════════════════════════ */

const PAGES_HTML = {
  login: `<div class="login-page">
  <div class="login-card">
    <div class="login-logo">
      <div class="logo-icon">S</div>
      <div class="logo-text-block">
        <div class="logo-name">SaaS Mayorista</div>
        <div class="logo-sub">Gesti\u00f3n para Distribuidoras</div>
      </div>
    </div>
    <div class="login-tabs">
      <button class="login-tab active" data-login-tab="login">Iniciar Sesi\u00f3n</button>
      <button class="login-tab" data-login-tab="register">Registrar Empresa</button>
    </div>
    <form class="login-form" id="login-form" onsubmit="return handleLogin(event)">
      <div class="form-group">
        <label for="login-email">Email</label>
        <input type="email" id="login-email" class="input" placeholder="admin@distribuidora.cl" required />
      </div>
      <div class="form-group">
        <label for="login-password">Contrase\u00f1a</label>
        <input type="password" id="login-password" class="input" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg">Ingresar</button>
      <div class="login-footer-text">\u00bfOlvidaste tu contrase\u00f1a? <a href="#">Recup\u00e9rala aqu\u00ed</a></div>
    </form>
    <form class="login-form hidden" id="register-form" onsubmit="return handleRegister(event)">
      <p class="login-subtitle">Registra tu empresa y crea el usuario administrador</p>
      <div class="form-group">
        <label for="reg-empresa">Nombre de la Empresa</label>
        <input type="text" id="reg-empresa" class="input" placeholder="Distribuidora del Sur SpA" required />
      </div>
      <div class="form-group">
        <label for="reg-rut">RUT Empresa</label>
        <input type="text" id="reg-rut" class="input" placeholder="76.123.456-7" required />
      </div>
      <div class="form-group">
        <label for="reg-giro">Giro</label>
        <input type="text" id="reg-giro" class="input" placeholder="Venta al por mayor de alimentos" required />
      </div>
      <hr class="form-divider" />
      <span class="form-divider-label">Datos del Administrador</span>
      <div class="form-group">
        <label for="reg-nombre">Nombre Completo</label>
        <input type="text" id="reg-nombre" class="input" placeholder="Juan P\u00e9rez Gonz\u00e1lez" required />
      </div>
      <div class="form-group">
        <label for="reg-email">Email</label>
        <input type="email" id="reg-email" class="input" placeholder="juan@distribuidora.cl" required />
      </div>
      <div class="form-group">
        <label for="reg-password">Contrase\u00f1a</label>
        <input type="password" id="reg-password" class="input" placeholder="M\u00ednimo 8 caracteres" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block btn-lg">Crear Empresa</button>
      <div class="login-footer-text">Al registrarte aceptas nuestros <a href="#">T\u00e9rminos y Condiciones</a></div>
    </form>
  </div>
</div>`,

  dashboard: `<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">S</div>
      <div class="logo-text-block">
        <div class="logo-text">SaaS Mayorista</div>
        <div class="logo-sub">Panel de Control</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Navegaci\u00f3n</div>
      <a class="nav-item active" href="#" data-page="dashboard">
        <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
        Dashboard
      </a>
      <a class="nav-item" href="#" data-page="productos">
        <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
        Productos <span class="badge badge-secondary nav-badge">342</span>
      </a>
      <a class="nav-item" href="#" data-page="pos">
        <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span>
        POS
      </a>
      <a class="nav-item" href="#" data-page="usuarios">
        <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
        Usuarios <span class="badge badge-info nav-badge">Admin</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="avatar" style="background: var(--color-primary);">JP</div>
      <div class="user-info">
        <div class="user-name">Juan P\u00e9rez</div>
        <div class="user-role">Administrador</div>
      </div>
    </div>
  </aside>
  <header class="topbar">
    <button class="mobile-toggle" onclick="toggleSidebar()">\u2630</button>
    <div class="topbar-breadcrumb"><span>Dashboard</span></div>
    <div class="topbar-title">Resumen General</div>
    <div class="topbar-right">
      <div class="topbar-user">
        <div class="user-details">
          <div class="name">Juan P\u00e9rez</div>
          <div class="role">Administrador</div>
        </div>
        <div class="avatar" style="background: var(--color-primary);">JP</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="showNotification('info', 'Sesi\u00f3n cerrada correctamente')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Salir</button>
    </div>
  </header>
  <main class="main-content dashboard-page">
    <div id="notification-area" style="margin-bottom: var(--space-4);"></div>
    <div class="stats-grid mb-6">
      <div class="kpi-card"><div class="kpi-row"><div><div class="kpi-label">Total Ventas Hoy</div><div class="kpi-value">$2.340.500</div><div class="kpi-change up">\u25b2 12.5% vs ayer</div></div><div class="kpi-icon teal">$</div></div></div>
      <div class="kpi-card"><div class="kpi-row"><div><div class="kpi-label">Productos Bajos Stock</div><div class="kpi-value" style="color: var(--color-warning);">12</div><div class="kpi-change down">\u26a0 Requieren reposici\u00f3n</div></div><div class="kpi-icon orange">!</div></div></div>
      <div class="kpi-card"><div class="kpi-row"><div><div class="kpi-label">Usuarios Activos</div><div class="kpi-value">8</div><div class="kpi-change up">\u25b2 2 esta semana</div></div><div class="kpi-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div></div>
      <div class="kpi-card"><div class="kpi-row"><div><div class="kpi-label">Ventas del Mes</div><div class="kpi-value">156</div><div class="kpi-change up">\u25b2 8.3% vs mes anterior</div></div><div class="kpi-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg></div></div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">\u00daltimas Ventas</span><a href="#" class="btn btn-ghost btn-sm">Ver todas \u2192</a></div>
      <div class="table-wrapper">
        <table class="data-table" id="dashboard-sales-table"><thead><tr><th>Folio</th><th>Cliente</th><th>RUT</th><th>Total</th><th>Tipo</th><th>Fecha</th></tr></thead><tbody></tbody></table>
      </div>
    </div>
  </main>
</div>`,

  productos: `<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">S</div>
      <div class="logo-text-block">
        <div class="logo-text">SaaS Mayorista</div>
        <div class="logo-sub">Panel de Control</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Navegaci\u00f3n</div>
      <a class="nav-item" href="#" data-page="dashboard"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span> Dashboard</a>
      <a class="nav-item active" href="#" data-page="productos"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span> Productos <span class="badge badge-secondary nav-badge">342</span></a>
      <a class="nav-item" href="#" data-page="pos"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span> POS</a>
      <a class="nav-item" href="#" data-page="usuarios"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> Usuarios <span class="badge badge-info nav-badge">Admin</span></a>
    </nav>
    <div class="sidebar-footer">
      <div class="avatar" style="background: var(--color-primary);">JP</div>
      <div class="user-info"><div class="user-name">Juan P\u00e9rez</div><div class="user-role">Administrador</div></div>
    </div>
  </aside>
  <header class="topbar">
    <button class="mobile-toggle" onclick="toggleSidebar()">\u2630</button>
    <div class="topbar-breadcrumb"><span>Dashboard</span><span>/</span><span>Productos</span></div>
    <div class="topbar-title">Inventario</div>
    <div class="topbar-right">
      <div class="topbar-user"><div class="user-details"><div class="name">Juan P\u00e9rez</div><div class="role">Administrador</div></div><div class="avatar" style="background: var(--color-primary);">JP</div></div>
      <button class="btn btn-ghost btn-sm" onclick="showNotification('info', 'Sesi\u00f3n cerrada')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Salir</button>
    </div>
  </header>
  <main class="main-content products-page">
    <div id="notification-area" style="margin-bottom: var(--space-4);"></div>
    <div class="page-header"><h1>Inventario <span class="header-count">(342 productos)</span></h1><button class="btn btn-primary" onclick="openModal('producto-modal')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nuevo Producto</button></div>
    <div class="filter-bar">
      <input type="text" class="input" placeholder="Buscar por nombre o c\u00f3digo..." style="min-width: 260px;" />
      <select class="select" style="min-width: 160px;"><option value="">Todas las categor\u00edas</option><option value="abarrotes">Abarrotes</option><option value="lacteos">L\u00e1cteos</option><option value="bebidas">Bebidas</option><option value="limpieza">Limpieza</option></select>
      <button class="btn btn-secondary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Filtrar</button>
    </div>
    <div class="card"><div class="table-wrapper"><table class="data-table" id="productos-table"><thead><tr><th>C\u00f3digo</th><th>Nombre</th><th>Stock</th><th>Stock M\u00edn.</th><th>Precio Venta</th><th>Estado</th><th class="text-center">Acciones</th></tr></thead><tbody></tbody></table></div></div>
    <div class="pagination">
      <button class="page-btn" onclick="changePage(-1)" id="prev-page">\u2039 Anterior</button>
      <span class="page-info" id="page-info">P\u00e1gina 1 de 4</span>
      <button class="page-btn" onclick="changePage(1)" id="next-page">Siguiente \u203a</button>
    </div>
  </main>
</div>
<div class="modal-overlay" id="producto-modal">
  <div class="modal">
    <div class="modal-header"><span class="modal-title">Nuevo Producto</span><button class="modal-close" onclick="closeModal('producto-modal')">\u2715</button></div>
    <div class="modal-body">
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        <div class="row" style="margin: 0; gap: var(--space-4);">
          <div class="form-group" style="flex: 1;"><label for="prod-codigo">C\u00f3digo</label><input type="text" id="prod-codigo" class="input" placeholder="PRO-001" /></div>
          <div class="form-group" style="flex: 2;"><label for="prod-nombre">Nombre del Producto</label><input type="text" id="prod-nombre" class="input" placeholder="Ej: Arroz Grado 1 1kg" /></div>
        </div>
        <div class="form-group"><label for="prod-categoria">Categor\u00eda</label><select id="prod-categoria" class="select"><option value="abarrotes">Abarrotes</option><option value="lacteos">L\u00e1cteos</option><option value="bebidas">Bebidas</option><option value="limpieza">Limpieza</option></select></div>
        <div class="row" style="margin: 0; gap: var(--space-4);">
          <div class="form-group" style="flex: 1;"><label for="prod-stock">Stock Actual</label><input type="number" id="prod-stock" class="input" value="0" /></div>
          <div class="form-group" style="flex: 1;"><label for="prod-stock-min">Stock M\u00ednimo</label><input type="number" id="prod-stock-min" class="input" value="10" /></div>
          <div class="form-group" style="flex: 1;"><label for="prod-precio">Precio Venta</label><input type="number" id="prod-precio" class="input" placeholder="$" /></div>
        </div>
        <div class="form-group"><label for="prod-descripcion">Descripci\u00f3n (opcional)</label><textarea id="prod-descripcion" class="textarea" placeholder="Descripci\u00f3n del producto..."></textarea></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal('producto-modal')">Cancelar</button><button class="btn btn-primary" onclick="closeModal('producto-modal'); showNotification('success', 'Producto creado correctamente')">Guardar Producto</button></div>
  </div>
</div>`,

  pos: `<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">S</div>
      <div class="logo-text-block">
        <div class="logo-text">SaaS Mayorista</div>
        <div class="logo-sub">Panel de Control</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Navegaci\u00f3n</div>
      <a class="nav-item" href="#" data-page="dashboard"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span> Dashboard</a>
      <a class="nav-item" href="#" data-page="productos"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span> Productos</a>
      <a class="nav-item active" href="#" data-page="pos"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span> POS</a>
      <a class="nav-item" href="#" data-page="usuarios"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> Usuarios <span class="badge badge-info nav-badge">Admin</span></a>
    </nav>
    <div class="sidebar-footer">
      <div class="avatar" style="background: var(--color-primary);">JP</div>
      <div class="user-info"><div class="user-name">Juan P\u00e9rez</div><div class="user-role">Vendedor</div></div>
    </div>
  </aside>
  <header class="topbar">
    <button class="mobile-toggle" onclick="toggleSidebar()">\u2630</button>
    <div class="topbar-breadcrumb"><span>Dashboard</span><span>/</span><span>POS</span></div>
    <div class="topbar-title">Punto de Venta</div>
    <div class="topbar-right">
      <div class="topbar-user"><div class="user-details"><div class="name">Juan P\u00e9rez</div><div class="role">Vendedor</div></div><div class="avatar" style="background: var(--color-primary);">JP</div></div>
      <button class="btn btn-ghost btn-sm" onclick="showNotification('info', 'Sesi\u00f3n cerrada')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Salir</button>
    </div>
  </header>
  <main class="main-content" style="padding-bottom: 0;">
    <div id="notification-area" style="margin-bottom: var(--space-4);"></div>
    <div class="pos-layout">
      <div class="pos-left">
        <div class="search-bar"><span class="search-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><input type="text" class="search-input" placeholder="Buscar producto por nombre o c\u00f3digo..." /></div>
        <div class="card"><div class="table-wrapper" style="max-height: 420px; overflow-y: auto;"><table class="data-table" id="pos-search-table"><thead><tr><th>C\u00f3digo</th><th>Producto</th><th>Stock</th><th>Precio</th><th class="text-center"></th></tr></thead><tbody></tbody></table></div></div>
      </div>
      <div class="pos-right">
        <div class="pos-cart">
          <div class="pos-cart-header"><h3>\ud83d\uded2 Carrito de Compra</h3><span class="badge badge-info" id="cart-count">0 \u00edtems</span></div>
          <div style="padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border);">
            <div class="pos-doc-selector">
              <button class="doc-btn active" onclick="selectDocType('boleta', this)">\ud83e\uddfe Boleta</button>
              <button class="doc-btn" onclick="selectDocType('factura', this)">\ud83d\udcc4 Factura</button>
            </div>
            <div class="pos-factura-fields" id="factura-fields" style="display: none;">
              <div class="form-group"><label>RUT Cliente</label><input type="text" class="input" placeholder="77.123.456-7" /></div>
              <div class="form-group"><label>Giro</label><input type="text" class="input" placeholder="Raz\u00f3n social del cliente" /></div>
            </div>
          </div>
          <div class="pos-cart-body"><div class="pos-cart-items" id="cart-items"><div class="empty-state" style="padding: var(--space-8) 0;"><div class="empty-icon">\ud83d\uded2</div><div class="empty-title">Carrito vac\u00edo</div><div class="empty-desc">Busca productos y agrega al carrito para iniciar una venta</div></div></div></div>
          <div class="pos-cart-summary" id="cart-summary" style="display: none;">
            <div class="summary-row"><span>Neto</span><span class="amount" id="cart-neto">$0</span></div>
            <div class="summary-row"><span>IVA (19%)</span><span class="amount" id="cart-iva">$0</span></div>
            <div class="summary-row total"><span>Total</span><span class="amount" id="cart-total">$0</span></div>
          </div>
          <div class="pos-cart-footer"><button class="btn btn-success btn-block btn-lg" onclick="confirmSale()">Confirmar Venta</button></div>
        </div>
      </div>
    </div>
  </main>
</div>`,

  usuarios: `<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">S</div>
      <div class="logo-text-block">
        <div class="logo-text">SaaS Mayorista</div>
        <div class="logo-sub">Panel de Control</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-label">Navegaci\u00f3n</div>
      <a class="nav-item" href="#" data-page="dashboard"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span> Dashboard</a>
      <a class="nav-item" href="#" data-page="productos"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span> Productos</a>
      <a class="nav-item" href="#" data-page="pos"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span> POS</a>
      <a class="nav-item active" href="#" data-page="usuarios"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> Usuarios <span class="badge badge-info nav-badge">Admin</span></a>
    </nav>
    <div class="sidebar-footer">
      <div class="avatar" style="background: var(--color-primary);">JP</div>
      <div class="user-info"><div class="user-name">Juan P\u00e9rez</div><div class="user-role">Administrador</div></div>
    </div>
  </aside>
  <header class="topbar">
    <button class="mobile-toggle" onclick="toggleSidebar()">\u2630</button>
    <div class="topbar-breadcrumb"><span>Dashboard</span><span>/</span><span>Usuarios</span></div>
    <div class="topbar-title">Gesti\u00f3n de Usuarios</div>
    <div class="topbar-right">
      <div class="topbar-user"><div class="user-details"><div class="name">Juan P\u00e9rez</div><div class="role">Administrador</div></div><div class="avatar" style="background: var(--color-primary);">JP</div></div>
      <button class="btn btn-ghost btn-sm" onclick="showNotification('info', 'Sesi\u00f3n cerrada')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Salir</button>
    </div>
  </header>
  <main class="main-content users-page">
    <div id="notification-area" style="margin-bottom: var(--space-4);"></div>
    <div class="page-header"><h1>Usuarios del Tenant</h1><button class="btn btn-primary" onclick="openModal('usuario-modal')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nuevo Usuario</button></div>
    <div class="card"><div class="table-wrapper"><table class="data-table" id="usuarios-table"><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Creado</th><th class="text-center">Acciones</th></tr></thead><tbody></tbody></table></div></div>
  </main>
</div>
<div class="modal-overlay" id="usuario-modal">
  <div class="modal">
    <div class="modal-header"><span class="modal-title">Nuevo Usuario</span><button class="modal-close" onclick="closeModal('usuario-modal')">\u2715</button></div>
    <div class="modal-body">
      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        <div class="form-group"><label for="user-nombre">Nombre Completo</label><input type="text" id="user-nombre" class="input" placeholder="Ej: Mar\u00eda Gonz\u00e1lez" /></div>
        <div class="form-group"><label for="user-email">Email</label><input type="email" id="user-email" class="input" placeholder="ejemplo@distribuidora.cl" /></div>
        <div class="form-group"><label for="user-password">Contrase\u00f1a</label><input type="password" id="user-password" class="input" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" /></div>
        <div class="form-group"><label for="user-rol">Rol</label><select id="user-rol" class="select"><option value="vendedor">Vendedor</option><option value="admin">Administrador</option></select></div>
      </div>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal('usuario-modal')">Cancelar</button><button class="btn btn-primary" onclick="closeModal('usuario-modal'); showNotification('success', 'Usuario creado correctamente')">Guardar Usuario</button></div>
  </div>
</div>`
};

/* ═══════════════════════════════════════════════════════════════════
   Navegación SPA (sin fetch)
   ═══════════════════════════════════════════════════════════════════ */

let currentPage = 1;
const PER_PAGE = 5;

function loadPage(page) {
  const container = document.getElementById('page-container');
  if (!container) return;

  /* Highlight showcase nav */
  document.querySelectorAll('.showcase-nav a').forEach(a => a.classList.remove('active'));
  const navLinks = document.querySelectorAll('.showcase-nav a');
  const pageNames = { login: 1, dashboard: 2, productos: 3, pos: 4, usuarios: 5 };
  const idx = pageNames[page];
  if (idx !== undefined && navLinks[idx]) navLinks[idx].classList.add('active');

  /* Embed HTML directly — no fetch */
  if (PAGES_HTML[page]) {
    container.innerHTML = PAGES_HTML[page];
    initCurrentPage();
    window.scrollTo(0, 0);
  } else {
    container.innerHTML = '<div class="empty-state" style="padding: 4rem;"><div class="empty-title">Error: página no encontrada</div></div>';
  }
}

function showLanding() {
  document.querySelectorAll('.showcase-nav a').forEach(a => a.classList.remove('active'));
  const first = document.querySelector('.showcase-nav a:first-child');
  if (first) first.classList.add('active');

  document.getElementById('page-container').innerHTML = LANDING_HTML;
}

/* ── Landing HTML ── */
const LANDING_HTML = `<div class="landing-welcome">
  <div class="welcome-icon">🏪</div>
  <h1>SaaS Mayorista</h1>
  <p>Mockup de diseño visual para sistema de gestión de distribuidoras mayoristas. Construido con Atomic Design (HTML/CSS/JS vanilla).</p>
  <div class="welcome-grid">
    ${['login', 'dashboard', 'productos', 'pos', 'usuarios'].map((p, i) =>
      `<a href="#" class="welcome-card" onclick="loadPage('${p}'); return false;">
        <div class="card-icon">${['🔐','📊','📦','🛒','👥'][i]}</div>
        <div class="card-title">${['Login','Dashboard','Productos','POS','Usuarios'][i]}</div>
        <div class="card-desc">${['Autenticación + bootstrap','KPIs y últimas ventas','Inventario paginado','Punto de venta con carrito','Roles ADMIN/VENDEDOR'][i]}</div>
      </a>`
    ).join('')}
  </div>
  <p style="margin-top: var(--space-8); font-size: var(--text-xs); color: var(--color-text-muted);">Paleta: Teal / Slate · Tipografía: Inter · Sistema: 4px base · Atomic Design</p>
</div>`;

/* ── Inicialización según página cargada ── */
function initCurrentPage() {
  const body = document.getElementById('page-container');
  if (!body) return;

  const isProducts = body.querySelector('#productos-table');
  const isDashboard = body.querySelector('#dashboard-sales-table');
  const isPOS = body.querySelector('#pos-search-table');
  const isUsers = body.querySelector('#usuarios-table');
  const isLogin = body.querySelector('.login-page');

  if (isProducts) renderProductos(1);
  if (isDashboard) renderDashboardSales();
  if (isPOS) renderPOSProducts();
  if (isUsers) renderUsuarios();
  if (isLogin) initLoginTabs();

  /* Sidebar nav clicks */
  body.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      loadPage(this.dataset.page);
    });
  });
}

/* ── Sidebar toggle (mobile) ── */
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

/* ── Login Tabs ── */
function initLoginTabs() {
  const container = document.getElementById('page-container');
  if (!container) return;
  container.querySelectorAll('[data-login-tab]').forEach(tab => {
    tab.addEventListener('click', function () {
      const tabName = this.dataset.loginTab; // 'login' or 'register'
      container.querySelectorAll('[data-login-tab]').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const formLogin = container.querySelector('#login-form');
      const formRegister = container.querySelector('#register-form');
      if (formLogin) formLogin.classList.toggle('hidden', tabName !== 'login');
      if (formRegister) formRegister.classList.toggle('hidden', tabName !== 'register');
    });
  });
}

/* ── Modal ── */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

/* Click outside modal */
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* ESC key */
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* ── Notification ── */
function showNotification(type, message) {
  const area = document.querySelector('#notification-area');
  if (!area) return;

  const banner = document.createElement('div');
  banner.className = 'notification-banner ' + type + ' show';
  banner.innerHTML = '<span>' + message + '</span><button class="notification-close" onclick="this.parentElement.remove()">✕</button>';

  area.innerHTML = '';
  area.appendChild(banner);

  setTimeout(() => {
    if (banner.parentElement) banner.remove();
  }, 3000);
}

/* ── Login handlers ── */
function handleLogin(e) {
  e.preventDefault();
  showNotification('success', 'Inicio de sesión exitoso. ¡Bienvenido!');
  setTimeout(() => loadPage('dashboard'), 500);
  return false;
}

function handleRegister(e) {
  e.preventDefault();
  showNotification('success', 'Empresa registrada correctamente.');
  return false;
}

/* ── Render: Dashboard Sales Table ── */
function renderDashboardSales() {
  const tbody = document.querySelector('#dashboard-sales-table tbody');
  if (!tbody) return;

  tbody.innerHTML = VENTAS.map(v =>
    '<tr><td><strong>' + v.folio + '</strong></td><td>' + v.cliente + '</td><td class="text-muted">' + v.rut + '</td><td class="font-semibold">' + formatCLP(v.total) + '</td><td><span class="badge ' + (v.tipo === 'factura' ? 'badge-info' : 'badge-secondary') + '">' + (v.tipo === 'factura' ? '📄 Factura' : '🧾 Boleta') + '</span></td><td class="text-muted">' + v.fecha + '</td></tr>'
  ).join('');
}

/* ── Render: Productos (paginado) ── */
function renderProductos(page) {
  currentPage = page;
  const tbody = document.querySelector('#productos-table tbody');
  if (!tbody) return;

  const start = (page - 1) * PER_PAGE;
  const items = PRODUCTOS.slice(start, start + PER_PAGE);
  const totalPages = Math.ceil(PRODUCTOS.length / PER_PAGE);

  tbody.innerHTML = items.map(p => {
    const isLow = p.stock <= p.stockMin;
    return '<tr class="' + (isLow ? 'row-warning' : '') + '">' +
      '<td><span class="tag">' + p.codigo + '</span></td>' +
      '<td><strong>' + p.nombre + '</strong></td>' +
      '<td class="' + (isLow ? 'text-danger font-semibold' : '') + '">' + p.stock + '</td>' +
      '<td>' + p.stockMin + '</td>' +
      '<td class="font-semibold">' + formatCLP(p.precio) + '</td>' +
      '<td>' + (isLow ? '<span class="badge badge-warning">⚠️ Stock Bajo</span>' : '<span class="badge badge-success">✔ OK</span>') + '</td>' +
      '<td class="text-center"><div class="actions" style="justify-content: center;">' +
        '<button class="btn btn-icon btn-ghost" title="Editar" onclick="showNotification(\'info\', \'Editando ' + p.nombre + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
        '<button class="btn btn-icon btn-ghost" title="Eliminar" onclick="showNotification(\'error\', \'¿Eliminar ' + p.codigo + '?\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
      '</div></td></tr>';
  }).join('');

  const info = document.getElementById('page-info');
  if (info) info.textContent = 'Página ' + page + ' de ' + totalPages;

  const prev = document.getElementById('prev-page');
  const next = document.getElementById('next-page');
  if (prev) { prev.disabled = page <= 1; prev.style.opacity = page <= 1 ? '0.4' : '1'; }
  if (next) { next.disabled = page >= totalPages; next.style.opacity = page >= totalPages ? '0.4' : '1'; }
}

function changePage(delta) {
  const totalPages = Math.ceil(PRODUCTOS.length / PER_PAGE);
  const newPage = currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) renderProductos(newPage);
}

/* ── Render: POS Products ── */
function renderPOSProducts() {
  const tbody = document.querySelector('#pos-search-table tbody');
  if (!tbody) return;

  tbody.innerHTML = PRODUCTOS.slice(0, 12).map(p =>
    '<tr><td><span class="tag">' + p.codigo + '</span></td><td><strong>' + p.nombre + '</strong></td><td class="' + (p.stock <= p.stockMin ? 'text-danger' : '') + '">' + p.stock + '</td><td class="font-semibold">' + formatCLP(p.precio) + '</td><td class="text-center"><button class="btn btn-sm btn-primary" onclick="addToCart(\'' + p.codigo + '\')">+ Agregar</button></td></tr>'
  ).join('');

  /* POS search input */
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      const filtered = q ? PRODUCTOS.filter(p => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)) : PRODUCTOS.slice(0, 12);
      tbody.innerHTML = filtered.slice(0, 12).map(p =>
        '<tr><td><span class="tag">' + p.codigo + '</span></td><td><strong>' + p.nombre + '</strong></td><td class="' + (p.stock <= p.stockMin ? 'text-danger' : '') + '">' + p.stock + '</td><td class="font-semibold">' + formatCLP(p.precio) + '</td><td class="text-center"><button class="btn btn-sm btn-primary" onclick="addToCart(\'' + p.codigo + '\')">+ Agregar</button></td></tr>'
      ).join('');
    });
  }
}

/* ── POS Cart ── */
let cart = [];

function addToCart(codigo) {
  const prod = PRODUCTOS.find(p => p.codigo === codigo);
  if (!prod) return;

  const existing = cart.find(c => c.codigo === codigo);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  renderCart();
  showNotification('success', prod.nombre + ' agregado al carrito');
}

function updateQty(codigo, delta) {
  const item = cart.find(c => c.codigo === codigo);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) {
    cart = cart.filter(c => c.codigo !== codigo);
  } else {
    item.qty = newQty;
  }
  renderCart();
}

function removeFromCart(codigo) {
  cart = cart.filter(c => c.codigo !== codigo);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const summary = document.getElementById('cart-summary');
  const count = document.getElementById('cart-count');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: var(--space-8) 0;"><div class="empty-icon">🛒</div><div class="empty-title">Carrito vacío</div><div class="empty-desc">Busca productos y agrega al carrito para iniciar una venta</div></div>';
    if (summary) summary.style.display = 'none';
    if (count) count.textContent = '0 ítems';
    return;
  }

  let total = 0;
  const rows = cart.map(item => {
    const subtotal = item.precio * item.qty;
    total += subtotal;
    return '<div class="pos-cart-item">' +
      '<div><div class="item-name">' + item.nombre + '</div><div class="text-xs text-muted">' + item.codigo + '</div></div>' +
      '<div class="item-qty"><button onclick="updateQty(\'' + item.codigo + '\', -1)">−</button><span class="qty-value">' + item.qty + '</span><button onclick="updateQty(\'' + item.codigo + '\', 1)">+</button></div>' +
      '<div class="item-price">' + formatCLP(item.precio) + '</div>' +
      '<button class="item-remove" onclick="removeFromCart(\'' + item.codigo + '\')">✕</button></div>';
  });
  container.innerHTML = rows.join('');

  const neto = Math.round(total / 1.19);
  const iva = total - neto;

  if (summary) {
    summary.style.display = 'block';
    document.getElementById('cart-neto').textContent = formatCLP(neto);
    document.getElementById('cart-iva').textContent = formatCLP(iva);
    document.getElementById('cart-total').textContent = formatCLP(total);
  }
  if (count) count.textContent = cart.reduce((s, c) => s + c.qty, 0) + ' ítems';
}

function confirmSale() {
  if (cart.length === 0) {
    showNotification('error', 'El carrito está vacío. Agrega productos antes de confirmar.');
    return;
  }
  showNotification('success', 'Venta confirmada correctamente!');
  cart = [];
  renderCart();
}

function selectDocType(type, btn) {
  const docBtns = btn.parentElement.querySelectorAll('.doc-btn');
  docBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const fields = document.getElementById('factura-fields');
  if (fields) {
    fields.style.display = type === 'factura' ? 'flex' : 'none';
  }
}

/* ── Render: Usuarios ── */
function renderUsuarios() {
  const tbody = document.querySelector('#usuarios-table tbody');
  if (!tbody) return;

  tbody.innerHTML = USUARIOS.map(u => {
    const color = u.rol === 'admin' ? '#0d9488' : '#475569';
    const initials = u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2);
    return '<tr>' +
      '<td><div class="flex-items-center gap-2"><div class="avatar avatar-sm" style="background: ' + color + ';">' + initials + '</div><strong>' + u.nombre + '</strong></div></td>' +
      '<td class="text-secondary">' + u.email + '</td>' +
      '<td><span class="badge ' + (u.rol === 'admin' ? 'badge-info' : 'badge-secondary') + '">' + (u.rol === 'admin' ? 'ADMIN' : 'VENDEDOR') + '</span></td>' +
      '<td><span class="badge ' + (u.estado === 'activo' ? 'badge-success' : 'badge-danger') + '">' + (u.estado === 'activo' ? 'Activo' : 'Inactivo') + '</span></td>' +
      '<td class="text-muted">' + u.creado + '</td>' +
      '<td class="text-center"><div class="actions" style="justify-content: center;">' +
        '<button class="btn btn-icon btn-ghost" title="Editar" onclick="showNotification(\'info\', \'Editando usuario ' + u.nombre + '\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
        '<button class="btn btn-icon btn-ghost" title="Eliminar" onclick="showNotification(\'error\', \'¿Eliminar a ' + u.nombre + '?\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
      '</div></td></tr>';
  }).join('');
}

/* ── Init on load ── */
document.addEventListener('DOMContentLoaded', function () {
  // Landing is already in index.html — no need to render
});
