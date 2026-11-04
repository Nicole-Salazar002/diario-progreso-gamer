import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { partidasApi } from '../services/partidasApi';
import { IPartida } from '../types';
export const ListaPartidas: React.FC = () => {
  const [partidas,setPartidas]=useState<IPartida[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const cargar=async()=>{try{setLoading(true);setError(null);setPartidas(await partidasApi.obtenerTodas());}catch(err:any){setError(err.message||'Error al obtener las partidas');}finally{setLoading(false);}};
  useEffect(()=>{cargar();},[]);
  return <><section className="page-intro"><span className="eyebrow">TU CAMINO COMO JUGADOR</span><h2>Historial de partidas</h2><p>Revive tus sesiones y mira cuánto has avanzado.</p></section>
  <div className="history-toolbar"><div className="history-summary"><span className="stat-icon blue-icon">◷</span><span><strong>{partidas.length} sesiones</strong><small>registradas en total</small></span></div><Link className="button button-primary" to="/partidas/nueva">＋ Registrar sesión</Link></div>
  {loading?<div className="panel state-panel"><span className="loader"/> Cargando historial…</div>:error?<div className="alert-error">{error}<button className="button button-quiet" onClick={cargar}>Reintentar</button></div>:partidas.length===0?<div className="panel empty-state"><span className="empty-icon">◷</span><h3>Aún no hay sesiones</h3><p>Registra tu próxima partida para comenzar tu diario de progreso.</p><Link className="button button-primary" to="/partidas/nueva">Registrar primera sesión</Link></div>:<div className="panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>VIDEOJUEGO</th><th>FECHA</th><th>DURACIÓN</th><th>AVANCE</th><th>NOTAS</th></tr></thead><tbody>{partidas.map(p=>{const nombre=typeof p.videojuego==='object'&&p.videojuego!==null?p.videojuego.nombre:'Juego';return <tr key={p._id}><td><span className="table-game-icon">✦</span><strong>{nombre}</strong></td><td>{new Date(p.fecha).toLocaleDateString()}</td><td>{p.duracionMinutos} min</td><td><span className="progress-cell"><span className="progress-track"><i style={{width:`${p.porcentajeAvance}%`}}/></span>{p.porcentajeAvance}%</span></td><td className="notes-cell">{p.notas||'—'}</td></tr>})}</tbody></table></div></div>}</>;
};
