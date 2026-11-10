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
  const [metaModalAbierto, setMetaModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cargarDatos = useCallback(async () => {
    if (!id) return;
    try { setLoading(true); setError(null); const [j, p, r, m, progreso] = await Promise.all([videojuegosApi.obtenerPorId(id), partidasApi.obtenerPorVideojuego(id), videojuegosApi.obtenerResumen(id), metasApi.obtenerPorVideojuego(id), videojuegosApi.obtenerProgresoSemanal(id)]); setJuego(j); setPartidas(p); setResumen(r); setMetas(m); setProgresoSemanal(progreso); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al cargar los datos'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void cargarDatos(); }, [cargarDatos]);
  useEffect(() => {
    if (!metaModalAbierto) return;
    const focoAnterior = document.activeElement as HTMLElement | null;
    const dialogo = document.querySelector<HTMLElement>('.goal-modal');
    const enfocarPrimero = () => {
    const inicial = formularioMetaAbierto
      ? dialogo?.querySelector<HTMLElement>('input')
      : dialogo?.querySelector<HTMLElement>('button');
    (inicial ?? dialogo)?.focus();
    };
    const atraparFoco = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMetaModalAbierto(false);
        setFormularioMetaAbierto(false);
        return;
      }
      if (event.key !== 'Tab' || !dialogo) return;
      const elementos = Array.from(dialogo.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      )).filter(elemento => elemento.offsetParent !== null);
      if (!elementos.length) return;
      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    };
    enfocarPrimero();
    document.addEventListener('keydown', atraparFoco);
    return () => {
      document.removeEventListener('keydown', atraparFoco);
      focoAnterior?.focus();
    };
  }, [metaModalAbierto, formularioMetaAbierto]);
  const toggleLogro = async (logroId: string, actual: boolean) => { if (!id) return; try { setJuego(await videojuegosApi.actualizarLogro(id, logroId, !actual)); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo actualizar el logro.'); } };
  const desactivarMeta = async (meta: IMeta) => {
    if (!window.confirm('¿Desactivar esta meta? Se conservará en el historial y podrás crear otra más adelante.')) return;
    try {
      await metasApi.desactivar(meta._id);
      setMetaModalAbierto(false);
      setFormularioMetaAbierto(false);
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
      onCrearMeta={() => { setFormularioMetaAbierto(true); setMetaModalAbierto(true); }}
    />
    {metaActiva && <section className="goal-launcher" aria-label="Meta semanal">
      <span><strong>Meta semanal activa</strong><small>{metaActiva.horasSemanales} h · {metaActiva.diasPorSemana} días</small></span>
      <button className="button button-secondary" type="button" onClick={() => { setFormularioMetaAbierto(false); setMetaModalAbierto(true); }}>Ver meta semanal</button>
    </section>}
    <div className="detail-columns"><section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">OBJETIVOS</span><h3>Logros <span className="count-pill">{completos}/{juego.logros.length}</span></h3></div></div>{juego.logros.length === 0 ? <div className="inline-empty">Todavía no hay logros para este juego.</div> : <ul className="achievement-list detail-achievements">{juego.logros.map(l => <li key={l._id}><label className={l.obtenido ? 'achievement-done' : ''}><input type="checkbox" checked={l.obtenido} onChange={() => toggleLogro(l._id!, l.obtenido)}/><span className="check-custom">✓</span><span>{l.nombre}</span></label>{l.obtenido && <span className="achievement-new">OBTENIDO</span>}</li>)}</ul>}</section>
      <section className="panel detail-panel"><div className="panel-heading"><div><span className="eyebrow">TU HISTORIA</span><h3>Sesiones recientes</h3></div><Link className="text-link" to={`/partidas/nueva?videojuego=${juego._id}`}>＋ Añadir</Link></div>{partidas.length === 0 ? <div className="inline-empty">Registra una partida para empezar tu historial.</div> : <div className="session-list">{partidas.map(p => <article className="session-row" key={p._id}><span className="session-date">{new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span><div className="session-data"><strong>{p.duracionMinutos} min de juego</strong><span>{p.notas || 'Sesión registrada'}</span></div><span className="session-percent">{p.porcentajeAvance}%</span><div className="session-actions"><Link className="button button-secondary" aria-label="Editar partida" to={`/partidas/${p._id}/editar`}>Editar</Link><button className="button button-quiet" type="button" aria-label="Eliminar partida" onClick={() => eliminarPartida(p)}>Eliminar</button></div></article>)}</div>}</section></div>
    {metaModalAbierto && <div className="goal-modal-backdrop" onMouseDown={event => {
      if (event.target === event.currentTarget) {
        setMetaModalAbierto(false);
        setFormularioMetaAbierto(false);
      }
    }}>
      <section className="goal-modal" role="dialog" aria-modal="true" aria-labelledby="goal-modal-title" tabIndex={-1}>
        <header className="goal-modal-heading">
          <div><span className="eyebrow">RITMO A TU MEDIDA</span><h2 id="goal-modal-title">Meta semanal</h2></div>
          <button className="goal-modal-close" type="button" aria-label="Cerrar meta semanal" onClick={() => { setMetaModalAbierto(false); setFormularioMetaAbierto(false); }}>×</button>
        </header>
        {formularioMetaAbierto && id ? (
          <FormularioMeta
            key={metaActiva?._id ?? 'nueva'}
            videojuegoId={id}
            meta={metaActiva}
            onGuardado={async () => {
              await cargarDatos();
              setFormularioMetaAbierto(false);
              setMetaModalAbierto(false);
            }}
            onCancelar={() => { setFormularioMetaAbierto(false); setMetaModalAbierto(false); }}
          />
        ) : metaActiva ? (
          <>
            <div className="goal-summary">
              <p>Tu objetivo actual para <strong>{juego.nombre}</strong>:</p>
              <p><strong>{metaActiva.horasSemanales} horas</strong> y <strong>{metaActiva.diasPorSemana} días</strong> por semana.</p>
              {progresoSemanal.hitos.length > 0 && <ul>
                {progresoSemanal.hitos.map((hito, indice) => <li key={`${hito.porcentajeObjetivo}-${indice}`}>
                  {hito.descripcion} · {hito.porcentajeObjetivo}%
                  {' — '}
                  <strong>{hito.alcanzado ? 'Alcanzado' : 'Pendiente'}</strong>
                </li>)}
              </ul>}
            </div>
            <div className="goal-modal-actions">
              <button className="button button-secondary" type="button" onClick={() => setFormularioMetaAbierto(true)}>Editar meta</button>
              <button className="button button-quiet" type="button" onClick={() => desactivarMeta(metaActiva)}>Desactivar</button>
            </div>
          </>
        ) : null}
      </section>
    </div>}
  </>;
};
