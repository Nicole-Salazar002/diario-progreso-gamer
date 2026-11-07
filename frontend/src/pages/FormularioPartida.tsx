import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';
import { partidasApi } from '../services/partidasApi';
import { IPartida, IVideojuego } from '../types';
import { ControlNumero } from '../components/ControlNumero';

const fechaLocalParaInput = (fecha: string) => {
  const date = new Date(fecha);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fechaActualParaInput = () => fechaLocalParaInput(new Date().toISOString());

export const FormularioPartida: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editando = Boolean(id);
  const [juegos, setJuegos] = useState<IVideojuego[]>([]);
  const [videojuegoId, setVideojuegoId] = useState('');
  const [fecha, setFecha] = useState(fechaActualParaInput);
  const [duracionMinutos, setDuracionMinutos] = useState(30);
  const [porcentajeAvance, setPorcentajeAvance] = useState(0);
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const [listaJuegos, partida] = await Promise.all([
          videojuegosApi.obtenerTodos(),
          id ? partidasApi.obtenerPorId(id) : Promise.resolve(null)
        ]);
        setJuegos(listaJuegos);
        if (partida) {
          setVideojuegoId(typeof partida.videojuego === 'string' ? partida.videojuego : partida.videojuego._id);
          setFecha(fechaLocalParaInput(partida.fecha));
          setDuracionMinutos(partida.duracionMinutos);
          setPorcentajeAvance(partida.porcentajeAvance);
          setNotas(partida.notas ?? '');
        } else {
          const juegoInicial = searchParams.get('videojuego');
          setVideojuegoId(listaJuegos.some(juego => juego._id === juegoInicial)
            ? juegoInicial!
            : listaJuegos[0]?._id ?? '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos de la partida');
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, [id, searchParams]);

  const juego = juegos.find(item => item._id === videojuegoId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!videojuegoId) {
      setError('Debes seleccionar un videojuego');
      return;
    }
    try {
      setError(null);
      setGuardando(true);
      const cambios: Partial<IPartida> = {
        fecha: new Date(fecha).toISOString(),
        duracionMinutos,
        porcentajeAvance,
        notas
      };
      const guardada = editando && id
        ? await partidasApi.actualizar(id, cambios)
        : await partidasApi.crear({ ...cambios, videojuego: videojuegoId });
      const videojuegoGuardado = typeof guardada.videojuego === 'string'
        ? guardada.videojuego
        : guardada.videojuego._id;
      navigate(`/videojuegos/${videojuegoGuardado || videojuegoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la partida');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="panel state-panel" role="status"><span className="loader"/> Cargando partida…</div>;
  if (error && editando && !juego) return <div className="alert-error" role="alert">{error}<Link className="button button-quiet" to="/partidas">Volver al historial</Link></div>;

  return <>
    <section className="page-intro">
      <span className="eyebrow">TU AVENTURA, EN DETALLE</span>
      <h2>{editando ? 'Editar sesión' : 'Registrar sesión'}</h2>
      <p>{editando ? 'Actualiza los detalles de esta partida.' : 'Un buen momento merece quedar en tu diario.'}</p>
    </section>
    <div className="form-layout">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        {error && <div className="alert-error" role="alert">{error}</div>}
        <div className="form-section-title"><span className="step-number">01</span><div><h3>Tu partida</h3><p>Selecciona el juego y cuéntanos cómo fue.</p></div></div>
        {editando
          ? <div className="field"><span>Videojuego</span><strong>{juego?.nombre ?? 'Videojuego asociado'}</strong></div>
          : juegos.length === 0
            ? <div className="empty-inline">Primero necesitas añadir un videojuego a tu biblioteca.<Link to="/videojuegos/nuevo"> Añadir videojuego →</Link></div>
            : <label className="field"><span>Videojuego</span><select value={videojuegoId} onChange={event => setVideojuegoId(event.target.value)}>{juegos.map(item => <option key={item._id} value={item._id}>{item.nombre} ({item.plataforma})</option>)}</select></label>}
        <label className="field"><span>Fecha y hora de la sesión</span><input required type="datetime-local" value={fecha} onChange={event => setFecha(event.target.value)}/></label>
        <div className="field-grid">
          <label className="field" htmlFor="session-duration"><span>Duración <small>MINUTOS</small></span><ControlNumero id="session-duration" valor={String(duracionMinutos)} alCambiar={valor => setDuracionMinutos(Number(valor))} minimo={1} paso={1} etiqueta="duración en minutos" /></label>
          <label className="field" htmlFor="session-progress"><span>Avance registrado <small>0–100%</small></span><div className="number-suffix"><ControlNumero id="session-progress" valor={String(porcentajeAvance)} alCambiar={valor => setPorcentajeAvance(Number(valor))} minimo={0} maximo={100} paso={1} etiqueta="avance registrado"/><span>%</span></div></label>
        </div>
        <div className="live-progress"><div><span>Progreso de esta sesión</span><strong>{porcentajeAvance}%</strong></div><div className="progress-track"><i style={{ width: `${porcentajeAvance}%` }}/></div></div>
        <label className="field"><span>Notas de la sesión <small>OPCIONAL</small></span><textarea rows={4} value={notas} onChange={event => setNotas(event.target.value)} placeholder="¿Qué pasó en tu partida? ¿Algún momento memorable?"/></label>
        <div className="form-actions">
          <Link className="button button-quiet" to={juego ? `/videojuegos/${juego._id}` : '/partidas'}>Cancelar</Link>
          <button className="button button-primary" type="submit" disabled={guardando || (!editando && juegos.length === 0)}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar sesión'} <span>→</span>
          </button>
        </div>
      </form>
      <aside className="form-aside session-aside"><div className="session-orb">◷</div><span className="eyebrow">TU DIARIO</span><h3>Cada partida suma</h3><p>Las sesiones que registres aparecerán en el historial del juego y en tu resumen de progreso.</p>{juego && <div className="current-game"><span className="table-game-icon">✦</span><span><small>JUGANDO</small><strong>{juego.nombre}</strong></span></div>}</aside>
    </div>
  </>;
};
