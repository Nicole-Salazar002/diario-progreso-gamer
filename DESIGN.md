# Sistema de diseño — Diario de Progreso Gamer

## Identidad

Una biblioteca gamer personal, cálida y enfocada en el progreso. La interfaz combina un marco lavanda con superficies índigo oscuras para que los datos y las acciones destaquen sin competir con las portadas de los juegos.

## Colores

| Token | Valor | Uso |
|---|---|---|
| `--page` | `#a994ed` | Fondo exterior lavanda |
| `--shell` | `#1a1b3a` | Superficie principal de la aplicación |
| `--panel` | `#222348` | Tarjetas y paneles |
| `--panel2` | `#282950` | Superficies elevadas y controles |
| `--text` | `#f4f2ff` | Texto principal |
| `--muted` | `#9699c3` | Texto secundario |
| `--blue` | `#70a9ff` | Enlaces, foco y acentos |
| `--purple` | `#9a7cff` | Acento violeta y progreso |
| `--line` | `rgba(190, 188, 255, .12)` | Bordes sutiles |

Se conservan los degradados lavanda/índigo y azul/violeta del producto. Los nuevos estilos deben reutilizar estas variables o derivar de ellas; no introducir colores aislados sin una razón documentada.

## Tipografía

- Texto y controles: **DM Sans**, con `sans-serif` como alternativa.
- Títulos y cifras destacadas: **Manrope**, con `sans-serif` como alternativa.
- Cargar las fuentes externas de forma no bloqueante y conservar alternativas legibles si no están disponibles.
- Mantener jerarquía clara: títulos breves, etiquetas discretas y cifras de progreso visibles.

## Espaciado y forma

- Escala recomendada para nuevos componentes: `4`, `8`, `12`, `16`, `24` y `32` px.
- Agrupar controles relacionados; dejar más espacio entre secciones que dentro de una tarjeta.
- El marco de aplicación usa esquinas amplias; paneles y tarjetas, radios medios; campos y botones, radios compactos.
- Usar bordes finos y sombras suaves para separar superficies oscuras sin recargarlas.
- Adaptar el espaciado a pantallas pequeñas; no forzar anchos fijos en el contenido.

## Componentes

- **Marco y navegación:** contenedor índigo, barra lateral de contraste sutil y navegación con estado activo azul-violeta.
- **Tarjetas y paneles:** superficie índigo, borde tenue y contenido agrupado con encabezado y etiqueta de sección cuando aporte orientación.
- **Botón principal:** degradado azul-violeta, texto claro y verbo de acción concreto. Acciones secundarias usan superficie discreta o estilo quiet.
- **Campos:** fondo oscuro, borde visible, etiqueta persistente y foco claramente perceptible.
- **Progreso y estadísticas:** mostrar valor, unidad y contexto; acompañar las barras con texto y no depender solo del color.
- **Estados:** carga, error y vacío deben tener texto explícito y una acción comprensible cuando corresponda.
- **Diseño adaptable:** conservar la navegación y la legibilidad al reorganizar la cuadrícula en los breakpoints existentes (1050, 760 y 420 px).

## Tono de los textos

- Escribir en español claro, cercano y alentador, sin juzgar los hábitos de juego.
- Usar frases breves y concretas: orientar, no presionar.
- Explicar errores y estados vacíos con palabras sencillas y ofrecer el siguiente paso útil.
- Mantener nombres y unidades consistentes: videojuego, partida, horas, días, racha e hito.

## Accesibilidad

- Usar HTML semántico, jerarquía de encabezados y etiquetas asociadas a cada control.
- Todo flujo debe poder recorrerse con teclado; los elementos interactivos necesitan foco visible.
- Asegurar contraste suficiente para texto, controles, bordes y estados; no comunicar información solo con color o iconos.
- Dar texto alternativo a imágenes con contenido y nombres accesibles a botones de solo icono.
- Respetar `prefers-reduced-motion` en animaciones y transiciones nuevas.
- En pantallas pequeñas, mantener controles utilizables, contenido legible y ausencia de desplazamiento horizontal innecesario.

## No hacemos

### Fondo exterior

El fondo exterior puede usar capas CSS de luz lavanda, magenta y violeta sobre tonos índigo profundos para crear una atmósfera difusa. Las superficies interiores permanecen oscuras y legibles; no se requieren imágenes externas para este efecto.

- No añadimos rankings, metas compartidas, notificaciones, recordatorios ni gráficos históricos.
- No usamos color como única señal de cumplimiento, error o estado.
- No incorporamos librerías de interfaz sin que estén autorizadas explícitamente en una spec y en este documento.
- No usamos mensajes que culpen, avergüencen o presionen a la persona por su ritmo de juego.
