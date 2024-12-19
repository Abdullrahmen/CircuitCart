import mongoose from 'mongoose';
import {
  paramSubModel,
  categoryParamSubModel,
  paramValidator,
} from './param.submodel';
const Schema = mongoose.Schema;

const productModel = new Schema({
  name: { type: String, required: true },
  seller: {
    name: { type: String, required: true }, // For faster search (denormalization)
    id: { type: Schema.Types.ObjectId, required: true, ref: 'Seller' },
  },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  product_imgs: { type: [String] },
  reviews: { type: [Schema.Types.ObjectId], ref: 'Review' },
  category_params: {
    type: [categoryParamSubModel],
    required: true,
    validate: {
      validator: paramValidator,
      message: 'category_params must be an array of unique objects',
    },
  },
  other_params: {
    type: [paramSubModel],
    validate: {
      validator: paramValidator,
      message: 'other_params must be an array of unique objects',
    },
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  stock: { type: Number, min: 0 },
  isPending: { type: Boolean, required: true },
  isHidden: { type: Boolean, required: true },
  total_sales: { type: Number, required: true, min: 0 },
});

export default mongoose.model('Product', productModel);
