import { Document, Schema, Types, model } from 'mongoose';

export interface IHitoMeta {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface IMeta extends Document {
  videojuego: Types.ObjectId;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: IHitoMeta[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CrearMetaInput {
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  hitos?: IHitoMeta[];
}

export type ActualizarMetaInput = Partial<Pick<IMeta, 'horasSemanales' | 'diasPorSemana' | 'hitos'>>;

const hitoSchema = new Schema<IHitoMeta>({
  descripcion: { type: String, required: [true, 'La descripción del hito es obligatoria'], trim: true },
  porcentajeObjetivo: {
    type: Number,
    required: [true, 'El porcentaje objetivo del hito es obligatorio'],
    min: [1, 'El porcentaje objetivo mínimo es 1'],
    max: [100, 'El porcentaje objetivo máximo es 100']
  }
}, { _id: false });

const metaSchema = new Schema<IMeta>({
  videojuego: {
    type: Schema.Types.ObjectId,
    ref: 'Videojuego',
    required: [true, 'El ID del videojuego es obligatorio']
  },
  horasSemanales: {
    type: Number,
    required: [true, 'Las horas semanales son obligatorias'],
    validate: {
      validator: (horas: number) => horas > 0,
      message: 'Las horas semanales deben ser mayores que 0'
    },
    max: [100, 'Las horas semanales no pueden superar 100']
  },
  diasPorSemana: {
    type: Number,
    required: [true, 'Los días por semana son obligatorios'],
    min: [1, 'Los días por semana deben ser al menos 1'],
    max: [7, 'Los días por semana no pueden superar 7'],
    validate: {
      validator: Number.isInteger,
      message: 'Los días por semana deben ser un número entero'
    }
  },
  activa: { type: Boolean, default: true },
  hitos: {
    type: [hitoSchema],
    default: [],
    validate: {
      validator: (hitos: IHitoMeta[]) => hitos.length <= 5,
      message: 'Una Meta no puede tener más de cinco hitos'
    }
  }
}, { timestamps: true });

metaSchema.index(
  { videojuego: 1 },
  {
    unique: true,
    partialFilterExpression: { activa: true },
    name: 'unica_meta_activa_por_videojuego'
  }
);

export const Meta = model<IMeta>('Meta', metaSchema);
