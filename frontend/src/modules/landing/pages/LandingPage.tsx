import { useNavigate } from 'react-router-dom';

const techStack = [
  { name: 'React 18 + TypeScript', role: 'Frontend', color: '#61dafb' },
  { name: 'Spring Boot 3.3', role: 'Backend API', color: '#6db33f' },
  { name: 'Java 17', role: 'Lenguaje base', color: '#b07219' },
  { name: 'PostgreSQL', role: 'Base de datos', color: '#336791' },
  { name: 'Redis', role: 'Sesiones + caché', color: '#dc382d' },
  { name: 'JWT (access + refresh)', role: 'Autenticación', color: '#0d9488' },
  { name: 'Vite', role: 'Build tool', color: '#646cff' },
  { name: 'Docker Compose', role: 'Infraestructura', color: '#2496ed' },
];

const features = [
  {
    icon: '🔐',
    title: 'Autenticación JWT',
    desc: 'Access + refresh tokens con bloqueo por fuerza bruta y rate limiting integrado.',
  },
  {
    icon: '🏢',
    title: 'Multitenancy',
    desc: 'Arquitectura multiinquilino con aislamiento por tenant en cada operación.',
  },
  {
    icon: '📊',
    title: 'Dashboard',
    desc: 'KPIs de ventas, stock bajo, usuarios activos y últimas transacciones.',
  },
  {
    icon: '📦',
    title: 'Gestión de Productos',
    desc: 'CRUD completo con código de barras, categorías, stock mínimo y precios.',
  },
  {
    icon: '🧾',
    title: 'Punto de Venta (POS)',
    desc: 'Facturación y boleta electrónica con selección de documentos y carrito.',
  },
  {
    icon: '👥',
    title: 'Gestión de Usuarios',
    desc: 'Roles ADMIN y VENDEDOR con rutas protegidas por autorización.',
  },
];

const modules = [
  { name: 'auth', desc: 'Login, registro de empresa (bootstrap), refresh tokens' },
  { name: 'products', desc: 'CRUD con stock, precios, código de barras, categorías' },
  { name: 'sales', desc: 'POS con carrito, factura/boleta, cliente y totales' },
  { name: 'users', desc: 'Administración de usuarios con roles y permisos' },
  { name: 'dashboard', desc: 'Resumen de ventas, KPIs y actividad reciente' },
  { name: 'tenant', desc: 'Aislamiento multitenant por empresa' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* ─── NAVBAR ─── */}
      <nav className="landing-navbar">
        <div className="landing-navbar-inner">
          <div className="landing-navbar-brand">
            <div className="landing-navbar-logo">S</div>
            <span className="landing-navbar-name">SaaS Mayorista</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">MVP v0.0.1</div>
          <h1>Plataforma de Gestión Comercial<br />para Alimentos Mayoristas</h1>
          <p className="landing-hero-subtitle">
            SaaS multitenant moderno con autenticación JWT, punto de venta,
            control de inventario y dashboard en tiempo real.
          </p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Acceder al Sistema
            </button>
            <a href="#tecnologias" className="btn btn-secondary btn-lg">
              Ver Tecnologías
            </a>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section id="tecnologias" className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Stack Tecnológico</h2>
          <p className="landing-section-desc">
            Construido con tecnologías modernas y robustas para producción.
          </p>
          <div className="landing-tech-grid">
            {techStack.map((tech) => (
              <div key={tech.name} className="landing-tech-card">
                <div
                  className="landing-tech-dot"
                  style={{ background: tech.color }}
                />
                <div>
                  <div className="landing-tech-name">{tech.name}</div>
                  <div className="landing-tech-role">{tech.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Funcionalidades Implementadas</h2>
          <p className="landing-section-desc">
            Todo lo que necesitas para gestionar tu distribuidora de alimentos.
          </p>
          <div className="landing-features-grid">
            {features.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Arquitectura del Sistema</h2>
          <p className="landing-section-desc">
            Diseño modular con separación clara de capas y responsabilidades.
          </p>
          <div className="landing-arch-grid">
            <div className="landing-arch-card">
              <h4>Frontend (React SPA)</h4>
              <ul>
                <li>React Router DOM con rutas protegidas</li>
                <li>Zustand para estado global</li>
                <li>Arquitectura atómica (CSS modular)</li>
                <li>Axios + interceptors HTTP</li>
                <li>TypeScript en toda la aplicación</li>
              </ul>
            </div>
            <div className="landing-arch-card">
              <h4>Backend (Spring Boot)</h4>
              <ul>
                <li>API RESTful con Spring Web</li>
                <li>Spring Security + JWT (access/refresh)</li>
                <li>JPA + Hibernate con PostgreSQL</li>
                <li>Redis para caché y blocklist de tokens</li>
                <li>Flyway para migraciones de base de datos</li>
                <li>Bucket4j para rate limiting</li>
                <li>OpenAPI / Swagger UI documentado</li>
              </ul>
            </div>
            <div className="landing-arch-card">
              <h4>Infraestructura</h4>
              <ul>
                <li>Docker Compose (dev / prod)</li>
                <li>PostgreSQL + Redis containers</li>
                <li>Nginx como proxy reverso</li>
                <li>Perfiles Spring (dev / prod)</li>
                <li>Health checks con Actuator</li>
                <li>Logging estructurado con Logback</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODULES ─── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Módulos del Sistema</h2>
          <p className="landing-section-desc">
            Backend organizado en módulos independientes con arquitectura hexagonal.
          </p>
          <div className="landing-modules-grid">
            {modules.map((m) => (
              <div key={m.name} className="landing-module-card">
                <code className="landing-module-name">{m.name}</code>
                <span className="landing-module-desc">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER / CREDIT ─── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo">S</div>
            <div>
              <div className="landing-footer-name">SaaS Mayorista</div>
              <div className="landing-footer-version">Versión MVP 0.0.1</div>
            </div>
          </div>
          <div className="landing-footer-credit">
            <p>
              Desarrollado por{' '}
              <strong>Frank Vogt</strong>
            </p>
            <p className="landing-footer-title">
              Ingeniero Informático — Mención Ciencia de Datos
            </p>
            <p className="landing-footer-sub">
              Arquitectura de software · Sistemas distribuidos · SaaS Multitenant
            </p>
          </div>
          <div className="landing-footer-links">
            <span>© {new Date().getFullYear()} Frank Vogt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}