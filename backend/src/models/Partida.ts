import { Schema, model, Document, Types } from 'mongoose';

export interface IPartida extends Document {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const partidaSchema = new Schema<IPartida>({
  videojuego: {
    type: Schema.Types.ObjectId,
    ref: 'Videojuego',
    required: [true, 'El ID del videojuego es obligatorio']
  },
  fecha: { type: Date, required: [true, 'La fecha es obligatoria'], default: Date.now },
  duracionMinutos: {
    type: Number,
    required: [true, 'La duración en minutos es obligatoria'],
    min: [1, 'La duración debe ser de al menos 1 minuto']
  },
  porcentajeAvance: {
    type: Number,
    required: [true, 'El porcentaje de avance es obligatorio'],
    min: [0, 'El avance mínimo es 0'],
    max: [100, 'El avance máximo es 100']
  },
  notas: { type: String, trim: true }
}, { timestamps: true });

export const Partida = model<IPartida>('Partida', partidaSchema);