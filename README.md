# Diario de Progreso Gamer

## 1. Intención del Proyecto
Aplicación web diseñada para llevar el control de los videojuegos en posesión, las sesiones de juego dedicadas a cada uno, y el cálculo automatizado del progreso real.

## 2. Modelo de Datos y Justificación

### Esquemas
* **Videojuego:** Ficha principal del juego que incluye sus atributos (`nombre`, `plataforma`, `genero`, `estado`) y una lista de `logros` embebidos.
* **Partida:** Registro individual de cada sesión con `fecha`, `duracionMinutos`, `porcentajeAvance` y `notas`, referenciando al id del `Videojuego`.

### Justificación de Decisiones Arquitectónicas
* **¿Por qué `logros` se embebe dentro de `Videojuego`?**
  Se lee siempre junto con el juego, no posee entidad independiente y es una lista acotada que no crece indefinidamente.
* **¿Por qué `Partida` se referencia y no se embebe?**
  Las partidas crecen sin límite con el paso del tiempo y requieren ser consultadas tanto de forma independiente como filtros globales.
* **¿Por qué el resumen se calcula en el backend?**
  Mantiene la lógica de negocio centralizada en la capa de servicio (`videojuegos.service.ts`), evitando duplicidad de lógica en el cliente y garantizando consistencia.

### 3. Fórmula del Resumen Calculado
Al consultar `GET /api/videojuegos/:id/resumen`:

1. **`totalPartidas`**: Conteo total de documentos en la colección `Partida` cuyo campo `videojuego` coincide con el `:id`.
2. **`horasTotales`**: Suma del campo `duracionMinutos` de todas las partidas del juego, dividida para 60 y redondeada a un decimal:
   * **Fórmula:** `round( Suma(duracionMinutos) / 60, 1 )`
3. **`ultimaSesion`**: La fecha (`fecha`) más reciente entre las partidas registradas para ese videojuego.
4. **`porcentajeAvanceActual`**: El valor de `porcentajeAvance` correspondiente a la partida más reciente.

## 4. Instalación y Ejecución Local

### Prerrequisitos
* Node.js (v18+)
* Cuenta y cluster en MongoDB Atlas

### Backend
```bash
cd backend
npm install
# Configurar .env basado en .env.example
npm run dev
```

## 5. Links Públicos
* **Backend:** [API desplegada](https://diario-progreso-gamer.onrender.com)
* **Frontend:** [Aplicación web](https://diario-progreso-gamer-1.onrender.com)
