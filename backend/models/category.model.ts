import mongoose from 'mongoose';
import types from '../utils/paramsTypes';

const Schema = mongoose.Schema;

const paramSubSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: types.ALL, required: true },
  },
  { _id: false }
);

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  main_params: [paramSubSchema],
});

const categoryModel = mongoose.model('Category', categorySchema);
export { categoryModel, categorySchema };
