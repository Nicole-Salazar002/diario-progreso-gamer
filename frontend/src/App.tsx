import { NavLink, Routes, Route, Link } from 'react-router-dom';
import { ListaVideojuegos, DetalleVideojuego, FormularioVideojuego, ListaPartidas, FormularioPartida } from './pages/index';
import './styles.css';

function App() {
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" to="/"><span className="brand-mark">✦</span><span>PLAYER<span className="brand-accent">LOG</span><small>DIARIO DE PROGRESO</small></span></Link>
      <div className="side-label">TU ESPACIO</div>
      <nav className="side-nav">
        <NavLink end to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}><span>▦</span> Mis videojuegos</NavLink>
        <NavLink to="/partidas" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}><span>◷</span> Historial de partidas</NavLink>
      </nav>
      <div className="side-label">ACCESOS RÁPIDOS</div>
      <Link className="nav-item" to="/videojuegos/nuevo"><span>＋</span> Añadir videojuego</Link>
      <Link className="nav-item" to="/partidas/nueva"><span>⌁</span> Registrar sesión</Link>
      <div className="sidebar-note"><span className="note-icon">✧</span><strong>Cada sesión cuenta</strong><p>Guarda tus momentos, celebra tus avances y sigue jugando.</p></div>
      <div className="profile"><span className="avatar">🎮</span><span><strong>Jugador</strong><small>Tu aventura continúa</small></span><span className="online-dot" /></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><span className="eyebrow">TU CENTRO DE JUEGO</span><h1>Diario gamer <span className="sparkle">✦</span></h1></div><div className="top-actions"><span className="today">✦ &nbsp; Un paso más en tu aventura</span><Link className="button button-primary" to="/partidas/nueva">＋ Nueva sesión</Link></div></header>
      <div className="content"><Routes>
        <Route path="/" element={<ListaVideojuegos />} />
        <Route path="/videojuegos/nuevo" element={<FormularioVideojuego />} />
        <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
        <Route path="/partidas" element={<ListaPartidas />} />
        <Route path="/partidas/nueva" element={<FormularioPartida />} />
      </Routes></div>
      <footer className="app-footer">PLAYERLOG <span>·</span> Tu historia, partida a partida</footer>
    </main>
  </div>;
}
export default App;
