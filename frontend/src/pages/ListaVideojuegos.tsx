import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';
import { IVideojuego } from '../types';
import '../biblioteca.css';

const art = ['art-violet', 'art-blue', 'art-pink', 'art-teal'];
const symbols = ['✦', '◈', '✧', '⌁'];
export const ListaVideojuegos: React.FC = () => {
  const [juegos, setJuegos] = useState<IVideojuego[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorEliminacion, setErrorEliminacion] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setJuegos(await videojuegosApi.obtenerTodos(filtro || undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los videojuegos');
    } finally {
      setLoading(false);
    }
  }, [filtro]);
  useEffect(() => { void cargar(); }, [cargar]);
  const eliminarJuego = async (juego: IVideojuego) => {
    const confirmado = window.confirm(
      `¿Eliminar "${juego.nombre}"? También se borrarán sus partidas y metas asociadas. Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setErrorEliminacion(null);
    setEliminandoId(juego._id);
    try {
      await videojuegosApi.eliminar(juego._id);
      setJuegos(actuales => actuales.filter(actual => actual._id !== juego._id));
    } catch (err) {
      setErrorEliminacion(err instanceof Error ? err.message : 'No se pudo eliminar el videojuego.');
    } finally {
      setEliminandoId(null);
    }
  };
  const jugando = juegos.filter(j => j.estado === 'jugando').length;
  return <>
    <section className="welcome-banner"><div className="banner-copy"><span className="eyebrow light">TU COLECCIÓN PERSONAL</span><h2>Tu próxima gran<br/>aventura empieza aquí.</h2><p>Registra tus juegos y lleva el seguimiento de cada logro.</p><Link className="button button-light" to="/videojuegos/nuevo">＋ Añadir videojuego</Link></div><div className="banner-orbit orbit-one"/><div className="banner-orbit orbit-two"/><div className="banner-art">🎮</div><span className="banner-spark">✦</span></section>
    <section className="stats-row"><article className="stat-card"><span className="stat-icon violet-icon">▦</span><div><strong>{juegos.length}</strong><span>Juegos en tu biblioteca</span></div></article><article className="stat-card"><span className="stat-icon blue-icon">◉</span><div><strong>{jugando}</strong><span>Aventuras en curso</span></div></article><article className="stat-card"><span className="stat-icon gold-icon">✧</span><div><strong>{juegos.reduce((n,j) => n + j.logros.filter(l => l.obtenido).length, 0)}</strong><span>Logros desbloqueados</span></div></article></section>
    <section className="section-heading"><div><span className="eyebrow">BIBLIOTECA</span><h2>Mis videojuegos <span className="count-pill">{juegos.length}</span></h2><p className="section-subtitle">Todo lo que estás jugando, a tu manera.</p></div><label className="filter-control"><span>Filtrar por estado</span><select value={filtro} onChange={e => setFiltro(e.target.value)}><option value="">Todos los estados</option><option value="jugando">Jugando</option><option value="pausado">Pausado</option><option value="completado">Completado</option><option value="abandonado">Abandonado</option></select></label></section>
    {errorEliminacion && <div className="alert-error" role="alert">{errorEliminacion}</div>}
    {loading ? <div className="panel state-panel"><span className="loader"/> Cargando tu biblioteca…</div> : error ? <div className="alert-error" role="alert">{error}<button className="button button-quiet" onClick={cargar}>Reintentar</button></div> : juegos.length === 0 ? <div className="panel empty-state"><span className="empty-icon">✧</span><h3>Tu biblioteca está esperando</h3><p>Añade tu primer videojuego y empieza a registrar tu progreso.</p><Link className="button button-primary" to="/videojuegos/nuevo">Añadir mi primer juego</Link></div> : <div className="game-grid">{juegos.map((j,i) => <div className="game-card-item" key={j._id}><Link to={`/videojuegos/${j._id}`} className="game-card"><div className={`game-art ${art[i % art.length]}`}><span className="art-symbol">{symbols[i % art.length]}</span>{j.portadaUrl && <img className="game-cover" src={j.portadaUrl} alt={`Portada de ${j.nombre}`} onError={e => { e.currentTarget.style.display = 'none'; }} />}<span className={`status-badge status-${j.estado}`}>{j.estado}</span><span className="art-platform">{j.plataforma}</span></div><div className="game-card-body"><div className="game-title-row"><h3>{j.nombre}</h3><span className="card-arrow">↗</span></div><p>{j.genero} <span>·</span> {j.logros.filter(l => l.obtenido).length}/{j.logros.length} logros</p><div className="mini-progress"><span style={{width: `${j.logros.length ? j.logros.filter(l => l.obtenido).length / j.logros.length * 100 : 0}%`}}/></div></div></Link><button className="button button-quiet game-card-delete" type="button" aria-label={`Eliminar ${j.nombre}`} disabled={eliminandoId === j._id} onClick={() => void eliminarJuego(j)}>{eliminandoId === j._id ? 'Eliminando…' : 'Eliminar'}</button></div>)}</div>}
  </>;
};
