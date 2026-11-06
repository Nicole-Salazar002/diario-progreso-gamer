import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';
import { partidasApi } from '../services/partidasApi';
import { metasApi } from '../services/metasApi';
import { FormularioMeta } from './FormularioMeta';
import { ProgresoSemanal } from './ProgresoSemanal';
import { IVideojuego, IPartida, IResumen, IMeta, IProgresoSemanal } from '../types';

export const DetalleVideojuego: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [juego, setJuego] = useState<IVideojuego | null>(null);
  const [partidas, setPartidas] = useState<IPartida[]>([]);
  const [resumen, setResumen] = useState<IResumen | null>(null);
  const [progresoSemanal, setProgresoSemanal] = useState<IProgresoSemanal | null>(null);
  const [metas, setMetas] = useState<IMeta[]>([]);
  const [formularioMetaAbierto, setFormularioMetaAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cargarDatos = useCallback(async () => {
    if (!id) return;
    try { setLoading(true); setError(null); const [j, p, r, m, progreso] = await Promise.all([videojuegosApi.obtenerPorId(id), partidasApi.obtenerPorVideojuego(id), videojuegosApi.obtenerResumen(id), metasApi.obtenerPorVideojuego(id), videojuegosApi.obtenerProgresoSemanal(id)]); setJuego(j); setPartidas(p); setResumen(r); setMetas(m); setProgresoSemanal(progreso); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar los datos'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void cargarDatos(); }, [cargarDatos]);
  const toggleLogro = async (logroId: string, actual: boolean) => { if (!id) return; try { setJuego(await videojuegosApi.actualizarLogro(id, logroId, !actual)); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo actualizar el logro.'); } };
  const desactivarMeta = async (meta: IMeta) => {
    if (!window.confirm('¿Desactivar esta meta? Se conservará en el historial y podrás crear otra más adelante.')) return;
    try {
      await metasApi.desactivar(meta._id);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar la meta.');
    }
  };
  const eliminarPartida = async (partida: IPartida) => {
    if (!window.confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
    try {
      await partidasApi.eliminar(partida._id);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la partida.');
    }
  };
  if (loading) return <div className="panel state-panel"><span className="loader"/> Cargando detalle del videojuego…</div>;
  if (error) return <div className="alert-error" role="alert">{error}<button className="button button-quiet" onClick={cargarDatos}>Reintentar</button></div>;
  if (!juego) return <div className="panel empty-state"><h3>No se encontró el videojuego</h3><Link to="/">Volver a la biblioteca</Link></div>;
  const completos = juego.logros.filter(l => l.obtenido).length;
  const metaActiva = metas.find(meta => meta.activa);
  const puedeCrearMeta = juego.estado !== 'completado' && juego.estado !== 'abandonado';
  if (!progresoSemanal) return <div className="alert-error" role="alert">No se pudo cargar el progreso semanal.<button className="button button-quiet" onClick={cargarDatos}>Reintentar</button></div>;
  return <><Link to="/" className="back-link">← Volver a la biblioteca</Link>
    <section className="detail-hero"><div className="detail-art"><span>✦</span><div>🎮</div>{juego.portadaUrl && <img src={juego.portadaUrl} alt={`Portada de ${juego.nombre}`} onError={e => { e.currentTarget.style.display = 'none'; }}/>}</div>
      <div className="detail-copy"><span className={`status-badge status-${juego.estado}`}>{juego.estado}</span><h2>{juego.nombre}</h2><p>{juego.plataforma} <span>·</span> {juego.genero}</p><div className="detail-actions"><Link className="button button-primary" to={`/partidas/nueva?videojuego=${juego._id}`}>＋ Registrar sesión</Link><span className="detail-subtle">{partidas.length} sesiones registradas</span></div></div>
      <div className="detail-progress"><strong>{resumen?.porcentajeAvanceActual ?? 0}<small>%</small></strong><span>avance actual</span><div className="progress-track"><i style={{ width: `${resumen?.porcentajeAvanceActual ?? 0}%` }}/></div></div>
    </section>
    <section className="section-heading detail-section-heading"><div><span className="eyebrow">ESTADÍSTICAS</span><h2>Tu progreso</h2></div></section>
    <div className="stats-row detail-stats"><article className="stat-card"><span className="stat-icon violet-icon">◷</span><div><strong>{resumen?.totalPartidas ?? 0}</strong><span>Sesiones jugadas</span></div></article><article className="stat-card"><span className="stat-icon blue-icon">⌁</span><div><strong>{resumen?.horasTotales ?? 0}<small> h</small></strong><span>Tiempo de juego</span></div></article><article className="stat-card"><span className="stat-icon gold-icon">✧</span><div><strong>{completos}<small> / {juego.logros.length}</small></strong><span>Logros obtenidos</span></div></article></div>
    <ProgresoSemanal
      progreso={progresoSemanal}
      puedeCrearMeta={puedeCrearMeta}
      onCrearMeta={() => setFormularioMetaAbierto(true)}
    />
    <div className="detail-columns"><section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">OBJETIVOS</span><h3>Logros <span className="count-pill">{completos}/{juego.logros.length}</span></h3></div></div>{juego.logros.length === 0 ? <div className="inline-empty">Todavía no hay logros para este juego.</div> : <ul className="achievement-list detail-achievements">{juego.logros.map(l => <li key={l._id}><label className={l.obtenido ? 'achievement-done' : ''}><input type="checkbox" checked={l.obtenido} onChange={() => toggleLogro(l._id!, l.obtenido)}/><span className="check-custom">✓</span><span>{l.nombre}</span></label>{l.obtenido && <span className="achievement-new">OBTENIDO</span>}</li>)}</ul>}</section>
      <section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">TU HISTORIA</span><h3>Sesiones recientes</h3></div><Link className="text-link" to={`/partidas/nueva?videojuego=${juego._id}`}>＋ Añadir</Link></div>{partidas.length === 0 ? <div className="inline-empty">Registra una partida para empezar tu historial.</div> : <div className="session-list">{partidas.map(p => <article className="session-row" key={p._id}><span className="session-date">{new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span><div className="session-data"><strong>{p.duracionMinutos} min de juego</strong><span>{p.notas || 'Sesión registrada'}</span></div><span className="session-percent">{p.porcentajeAvance}%</span><div className="session-actions"><Link className="button button-secondary" aria-label="Editar partida" to={`/partidas/${p._id}/editar`}>Editar</Link><button className="button button-quiet" type="button" aria-label="Eliminar partida" onClick={() => eliminarPartida(p)}>Eliminar</button></div></article>)}</div>}</section></div>
    {(metaActiva || formularioMetaAbierto) && <section className="panel goal-panel" aria-labelledby="goal-panel-title">
      <div className="panel-heading">
        <div><span className="eyebrow">RITMO A TU MEDIDA</span><h3 id="goal-panel-title">Meta semanal</h3></div>
        {metaActiva && !formularioMetaAbierto && <div className="goal-actions">
          <button className="button button-secondary" type="button" onClick={() => setFormularioMetaAbierto(true)}>Editar meta</button>
          <button className="button button-quiet" type="button" onClick={() => desactivarMeta(metaActiva)}>Desactivar</button>
        </div>}
      </div>
      {formularioMetaAbierto && id ? (
        <FormularioMeta
          key={metaActiva?._id ?? 'nueva'}
          videojuegoId={id}
          meta={metaActiva}
          onGuardado={async () => {
            await cargarDatos();
            setFormularioMetaAbierto(false);
          }}
          onCancelar={() => setFormularioMetaAbierto(false)}
        />
      ) : metaActiva ? (
        <div className="goal-summary">
          <p>Tu objetivo actual para <strong>{juego.nombre}</strong>:</p>
          <p><strong>{metaActiva.horasSemanales} horas</strong> y <strong>{metaActiva.diasPorSemana} días</strong> por semana.</p>
          {metaActiva.hitos.length > 0 && <ul>
            {metaActiva.hitos.map((hito, indice) => <li key={`${hito.porcentajeObjetivo}-${indice}`}>
              {hito.descripcion} · {hito.porcentajeObjetivo}%
            </li>)}
          </ul>}
        </div>
      ) : null}
    </section>}
  </>;
};
