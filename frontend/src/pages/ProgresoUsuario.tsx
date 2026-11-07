import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';
import { IProgresoSemanal, IVideojuego } from '../types';

interface ProgresoJuego { juego: IVideojuego; progreso: IProgresoSemanal; }

export const ProgresoUsuario: React.FC = () => {
  const [elementos, setElementos] = useState<ProgresoJuego[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const juegos = await videojuegosApi.obtenerTodos();
      const progresos = await Promise.all(juegos.map(async (juego) => ({
        juego,
        progreso: await videojuegosApi.obtenerProgresoSemanal(juego._id)
      })));
      setElementos(progresos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar tu progreso.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  if (cargando) return <div className="panel state-panel" role="status"><span className="loader" /> Cargando tu progreso…</div>;
  if (error) return <div className="alert-error" role="alert">{error}<button className="button button-quiet" type="button" onClick={() => void cargar()}>Reintentar</button></div>;

  return <section className="user-progress-page">
    <div className="page-intro progress-intro">
      <span className="eyebrow">CENTRO DE PROGRESO</span>
      <h2>Mi progreso</h2>
      <p>Consulta cómo avanza cada aventura durante la semana.</p>
    </div>
    {elementos.length === 0 ? (
      <div className="panel empty-state">
        <span className="empty-icon" aria-hidden="true">✦</span>
        <h3>Aún no tienes videojuegos</h3>
        <p>Añade un juego para empezar a ver tu progreso semanal aquí.</p>
        <Link className="button button-primary" to="/videojuegos/nuevo">Añadir videojuego</Link>
      </div>
    ) : <>
      <p className="user-progress-count">{elementos.length} {elementos.length === 1 ? 'videojuego' : 'videojuegos'} en tu progreso</p>
      <div className="user-progress-grid">
        {elementos.map(({ juego, progreso }) => (
          <article className="panel user-progress-card" key={juego._id}>
            <div className="user-progress-card-heading">
              <div className="user-progress-game-mark" aria-hidden="true">◈</div>
              <div className="user-progress-game-title">
                <span className={`status-badge status-${juego.estado}`}>{juego.estado}</span>
                <h3>{juego.nombre}</h3>
              </div>
            </div>
            <p className="user-progress-week">{progreso.semana.inicio} – {progreso.semana.fin}</p>
            <div className="user-progress-metrics">
              <div><span>Horas esta semana</span><strong>{progreso.horasSemana}<small> h</small></strong></div>
              <div><span>Días jugados</span><strong>{progreso.diasJugadosSemana}</strong></div>
              <div className="user-progress-streak"><span>Racha actual</span><strong><span aria-hidden="true">🔥</span> {progreso.rachaActual}<small> días</small></strong><small>Mejor: {progreso.mejorRacha} días</small></div>
            </div>
            <Link className="button button-secondary user-progress-link" to={`/videojuegos/${juego._id}`}>Ver progreso del juego <span aria-hidden="true">→</span></Link>
          </article>
        ))}
      </div>
    </>}
  </section>;
};
