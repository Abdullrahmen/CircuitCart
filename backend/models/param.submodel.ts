import mongoose from 'mongoose';
import paramsTypes from '../utils/paramsTypes';
import { isUnique } from '../utils/array';
const Schema = mongoose.Schema;

const categoryParamSubModel = new Schema(
  {
    name: { type: String, required: true },
    available: {
      type: [Schema.Types.Mixed],
      required: true,
    },
  },
  { _id: false }
);

const paramSubModel = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      lowercase: true,
      enum: paramsTypes.ALL,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paramValidator = (v: any[]) =>
  Array.isArray(v) && v.map((e) => e.name).every(isUnique);

export { paramSubModel, categoryParamSubModel, paramValidator };
