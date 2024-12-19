import mongoose from 'mongoose';
import types from '../utils/paramsTypes';
import { isUnique } from '../utils/array';

const Schema = mongoose.Schema;

interface Param {
  name: string;
  type: string;
}

const paramSubSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: types.ALL, required: true, lowercase: true },
  },
  { _id: false }
);

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  parameters: {
    type: [paramSubSchema],
    required: true,
    validate: {
      validator: (v: Param[]) =>
        Array.isArray(v) &&
        v.length > 0 &&
        v.map((e) => e.name).every(isUnique),
      message: 'parameters names must be an array of unique objects',
    },
  },
});

const categoryModel = mongoose.model('Category', categorySchema);
export { categoryModel, categorySchema };
