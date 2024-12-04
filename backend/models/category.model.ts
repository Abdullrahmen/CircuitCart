import mongoose from 'mongoose';
import types from '../utils/paramsTypes';

const Schema = mongoose.Schema;

const paramSubModel = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: types.ALL, required: true },
  },
  { _id: false }
);

const categoryModel = new Schema({
  name: { type: String, required: true },
  main_params: [paramSubModel],
});

export default mongoose.model('Category', categoryModel);
