import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videojuegosApi } from '../services/videojuegosApi';

export const FormularioVideojuego: React.FC = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [portadaUrl, setPortadaUrl] = useState('');
  const [plataforma, setPlataforma] = useState<'PC' | 'PlayStation' | 'Xbox' | 'Switch' | 'Movil'>('PC');
  const [genero, setGenero] = useState<'accion' | 'rol' | 'estrategia' | 'puzzle' | 'deportes' | 'otro'>('accion');
  const [estado, setEstado] = useState<'jugando' | 'pausado' | 'completado' | 'abandonado'>('jugando');
  const [logroInput, setLogroInput] = useState('');
  const [logros, setLogros] = useState<{ nombre: string; obtenido: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const agregarLogro = () => {
    if (!logroInput.trim()) return;
    setLogros([...logros, { nombre: logroInput.trim(), obtenido: false }]);
    setLogroInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await videojuegosApi.crear({ nombre, portadaUrl: portadaUrl.trim(), plataforma, genero, estado, logros });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el videojuego');
    }
  };

  return <>
    <section className="page-intro"><span className="eyebrow">AMPLÍA TU UNIVERSO</span><h2>Añadir videojuego</h2><p>Prepara tu espacio para la próxima aventura.</p></section>
    <div className="form-layout"><form className="panel form-panel" onSubmit={handleSubmit}>
      {error && <div className="alert-error">{error}</div>}
      <div className="form-section-title"><span className="step-number">01</span><div><h3>Detalles del juego</h3><p>Cuéntanos sobre esta aventura.</p></div></div>
      <label className="field"><span>Nombre del videojuego</span><input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. The Legend of Zelda" /></label>
      <label className="field"><span>Portada <small>OPCIONAL · URL DE IMAGEN</small></span><input type="url" value={portadaUrl} onChange={e => setPortadaUrl(e.target.value)} placeholder="https://..."/><small className="field-hint">Pega un enlace directo a la imagen de portada.</small></label>
      {portadaUrl && <div className="cover-preview"><img src={portadaUrl} alt={`Vista previa de portada${nombre ? ` de ${nombre}` : ''}`} onError={e => { e.currentTarget.style.display = 'none'; }} onLoad={e => { e.currentTarget.style.display = 'block'; }} /><span>Vista previa de portada</span></div>}
      <div className="field-grid"><label className="field"><span>Plataforma</span><select value={plataforma} onChange={e => setPlataforma(e.target.value as any)}><option value="PC">PC</option><option value="PlayStation">PlayStation</option><option value="Xbox">Xbox</option><option value="Switch">Switch</option><option value="Movil">Móvil</option></select></label><label className="field"><span>Género</span><select value={genero} onChange={e => setGenero(e.target.value as any)}><option value="accion">Acción</option><option value="rol">Rol</option><option value="estrategia">Estrategia</option><option value="puzzle">Puzzle</option><option value="deportes">Deportes</option><option value="otro">Otro</option></select></label></div>
      <label className="field"><span>Estado actual</span><select value={estado} onChange={e => setEstado(e.target.value as any)}><option value="jugando">Jugando ahora</option><option value="pausado">En pausa</option><option value="completado">Completado</option><option value="abandonado">Abandonado</option></select></label>
      <div className="form-section-title form-section-spaced"><span className="step-number">02</span><div><h3>Logros iniciales <span className="optional">OPCIONAL</span></h3><p>Agrega objetivos que quieras seguir.</p></div></div>
      <div className="inline-input"><input value={logroInput} onChange={e => setLogroInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarLogro(); } }} placeholder="Ej. Completar el tutorial"/><button type="button" className="button button-secondary" onClick={agregarLogro}>＋ Añadir</button></div>
      {logros.length > 0 && <ul className="achievement-list">{logros.map((l, i) => <li key={i}><span>◇</span>{l.nombre}<span className="achievement-new">NUEVO</span></li>)}</ul>}
      <div className="form-actions"><Link className="button button-quiet" to="/">Cancelar</Link><button className="button button-primary" type="submit">Guardar videojuego <span>→</span></button></div>
    </form><aside className="form-aside"><div className="aside-art">{portadaUrl ? <img src={portadaUrl} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <><span>✧</span><div>🎮</div></>}</div><h3>{nombre || 'Una nueva aventura'}</h3><p>Tu progreso empieza con una buena historia. Añade el juego y guarda cada sesión.</p><div className="aside-tip"><span>✦</span><span>La portada te ayudará a reconocer tu juego de un vistazo.</span></div></aside></div>
  </>;
};
