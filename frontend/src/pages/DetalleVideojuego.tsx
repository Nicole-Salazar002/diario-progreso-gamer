import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';
import { partidasApi } from '../services/partidasApi';
import { IVideojuego, IPartida, IResumen } from '../types';

export const DetalleVideojuego: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [juego, setJuego] = useState<IVideojuego | null>(null);
  const [partidas, setPartidas] = useState<IPartida[]>([]);
  const [resumen, setResumen] = useState<IResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cargarDatos = async () => {
    if (!id) return;
    try { setLoading(true); setError(null); const [j, p, r] = await Promise.all([videojuegosApi.obtenerPorId(id), partidasApi.obtenerPorVideojuego(id), videojuegosApi.obtenerResumen(id)]); setJuego(j); setPartidas(p); setResumen(r); }
    catch (err: any) { setError(err.message || 'Error al cargar los datos'); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargarDatos(); }, [id]);
  const toggleLogro = async (logroId: string, actual: boolean) => { if (!id) return; try { setJuego(await videojuegosApi.actualizarLogro(id, logroId, !actual)); } catch (err: any) { setError(err.message); } };
  if (loading) return <div className="panel state-panel"><span className="loader"/> Cargando detalle del videojuego…</div>;
  if (error) return <div className="alert-error">{error}<button className="button button-quiet" onClick={cargarDatos}>Reintentar</button></div>;
  if (!juego) return <div className="panel empty-state"><h3>No se encontró el videojuego</h3><Link to="/">Volver a la biblioteca</Link></div>;
  const completos = juego.logros.filter(l => l.obtenido).length;
  return <><Link to="/" className="back-link">← Volver a la biblioteca</Link>
    <section className="detail-hero"><div className="detail-art"><span>✦</span><div>🎮</div>{juego.portadaUrl && <img src={juego.portadaUrl} alt={`Portada de ${juego.nombre}`} onError={e => { e.currentTarget.style.display = 'none'; }}/>}</div>
      <div className="detail-copy"><span className={`status-badge status-${juego.estado}`}>{juego.estado}</span><h2>{juego.nombre}</h2><p>{juego.plataforma} <span>·</span> {juego.genero}</p><div className="detail-actions"><Link className="button button-primary" to="/partidas/nueva">＋ Registrar sesión</Link><span className="detail-subtle">{partidas.length} sesiones registradas</span></div></div>
      <div className="detail-progress"><strong>{resumen?.porcentajeAvanceActual ?? 0}<small>%</small></strong><span>avance actual</span><div className="progress-track"><i style={{ width: `${resumen?.porcentajeAvanceActual ?? 0}%` }}/></div></div>
    </section>
    <section className="section-heading detail-section-heading"><div><span className="eyebrow">ESTADÍSTICAS</span><h2>Tu progreso</h2></div></section>
    <div className="stats-row detail-stats"><article className="stat-card"><span className="stat-icon violet-icon">◷</span><div><strong>{resumen?.totalPartidas ?? 0}</strong><span>Sesiones jugadas</span></div></article><article className="stat-card"><span className="stat-icon blue-icon">⌁</span><div><strong>{resumen?.horasTotales ?? 0}<small> h</small></strong><span>Tiempo de juego</span></div></article><article className="stat-card"><span className="stat-icon gold-icon">✧</span><div><strong>{completos}<small> / {juego.logros.length}</small></strong><span>Logros obtenidos</span></div></article></div>
    <div className="detail-columns"><section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">OBJETIVOS</span><h3>Logros <span className="count-pill">{completos}/{juego.logros.length}</span></h3></div></div>{juego.logros.length === 0 ? <div className="inline-empty">Todavía no hay logros para este juego.</div> : <ul className="achievement-list detail-achievements">{juego.logros.map(l => <li key={l._id}><label className={l.obtenido ? 'achievement-done' : ''}><input type="checkbox" checked={l.obtenido} onChange={() => toggleLogro(l._id!, l.obtenido)}/><span className="check-custom">✓</span><span>{l.nombre}</span></label>{l.obtenido && <span className="achievement-new">OBTENIDO</span>}</li>)}</ul>}</section>
      <section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">TU HISTORIA</span><h3>Sesiones recientes</h3></div><Link className="text-link" to="/partidas/nueva">＋ Añadir</Link></div>{partidas.length === 0 ? <div className="inline-empty">Registra una partida para empezar tu historial.</div> : <div className="session-list">{partidas.map(p => <article className="session-row" key={p._id}><span className="session-date">{new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span><div className="session-data"><strong>{p.duracionMinutos} min de juego</strong><span>{p.notas || 'Sesión registrada'}</span></div><span className="session-percent">{p.porcentajeAvance}%</span></article>)}</div>}</section></div>
  </>;
};
