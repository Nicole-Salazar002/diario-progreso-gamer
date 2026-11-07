import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { partidasApi } from '../services/partidasApi';
import { IPartida } from '../types';
export const ListaPartidas: React.FC = () => {
  const navigate = useNavigate();
  const [partidas,setPartidas]=useState<IPartida[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPartidas(await partidasApi.obtenerTodas());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener las partidas');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);
  const eliminar = async (partida: IPartida) => {
    if (!window.confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
    try {
      await partidasApi.eliminar(partida._id);
      const videojuegoId = typeof partida.videojuego === 'string' ? partida.videojuego : partida.videojuego._id;
      if (videojuegoId) navigate(`/videojuegos/${videojuegoId}`);
      else await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la partida');
    }
  };
  return <><section className="page-intro"><span className="eyebrow">TU CAMINO COMO JUGADOR</span><h2>Historial de partidas</h2><p>Revive tus sesiones y mira cuánto has avanzado.</p></section>
  <div className="history-toolbar"><div className="history-summary"><span className="stat-icon blue-icon">◷</span><span><strong>{partidas.length} sesiones</strong><small>registradas en total</small></span></div><Link className="button button-primary" to="/partidas/nueva">＋ Registrar sesión</Link></div>
  {loading?<div className="panel state-panel"><span className="loader"/> Cargando historial…</div>:error?<div className="alert-error" role="alert">{error}<button className="button button-quiet" onClick={cargar}>Reintentar</button></div>:partidas.length===0?<div className="panel empty-state"><span className="empty-icon">◷</span><h3>Aún no hay sesiones</h3><p>Registra tu próxima partida para comenzar tu diario de progreso.</p><Link className="button button-primary" to="/partidas/nueva">Registrar primera sesión</Link></div>:<div className="panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>VIDEOJUEGO</th><th>FECHA</th><th>DURACIÓN</th><th>AVANCE</th><th>NOTAS</th><th>ACCIONES</th></tr></thead><tbody>{partidas.map(p=>{const nombre=typeof p.videojuego==='object'&&p.videojuego!==null?p.videojuego.nombre:'Juego';return <tr key={p._id}><td><span className="table-game-icon">✦</span><strong>{nombre}</strong></td><td>{new Date(p.fecha).toLocaleDateString()}</td><td>{p.duracionMinutos} min</td><td><span className="progress-cell"><span className="progress-track"><i style={{width:`${p.porcentajeAvance}%`}}/></span>{p.porcentajeAvance}%</span></td><td className="notes-cell">{p.notas||'—'}</td><td><div className="table-actions"><Link className="button button-secondary" aria-label="Editar partida" to={`/partidas/${p._id}/editar`}>Editar</Link><button className="button button-quiet" aria-label="Eliminar partida" onClick={() => eliminar(p)}>Eliminar</button></div></td></tr>})}</tbody></table></div></div>}</>;
};
