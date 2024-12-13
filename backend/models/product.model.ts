import mongoose from 'mongoose';
import paramSubModel from './param.submodel';

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
  main_params: { type: [paramSubModel], required: true },
  rating: { type: Number, min: 0, max: 5 },
  isPending: { type: Boolean, required: true },
  isHidden: { type: Boolean, required: true },
  total_sales: { type: Number, required: true, min: 0 },
});

export default mongoose.model('Product', productModel);
