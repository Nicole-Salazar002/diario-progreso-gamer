import { Schema, model, Document } from 'mongoose';

export interface ILogro {
  _id?: string;
  nombre: string;
  obtenido: boolean;
}

export interface IVideojuego extends Document {
  nombre: string;
  plataforma: 'PC' | 'PlayStation' | 'Xbox' | 'Switch' | 'Movil';
  genero: 'accion' | 'rol' | 'estrategia' | 'puzzle' | 'deportes' | 'otro';
  estado: 'jugando' | 'pausado' | 'completado' | 'abandonado';
  logros: ILogro[];
  portadaUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const logroSchema = new Schema<ILogro>({
  nombre: { type: String, required: [true, 'El nombre del logro es obligatorio'] },
  obtenido: { type: Boolean, default: false }
});

const videojuegoSchema = new Schema<IVideojuego>({
  nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
  plataforma: {
    type: String,
    required: [true, 'La plataforma es obligatoria'],
    enum: ['PC', 'PlayStation', 'Xbox', 'Switch', 'Movil']
  },
  genero: {
    type: String,
    required: [true, 'El género es obligatorio'],
    enum: ['accion', 'rol', 'estrategia', 'puzzle', 'deportes', 'otro']
  },
  estado: {
    type: String,
    required: [true, 'El estado es obligatorio'],
    enum: ['jugando', 'pausado', 'completado', 'abandonado'],
    default: 'jugando'
  },
  portadaUrl: { type: String, trim: true, default: '' },
  logros: [logroSchema]
}, { timestamps: true });

export const Videojuego = model<IVideojuego>('Videojuego', videojuegoSchema);
