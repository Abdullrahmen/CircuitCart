import mongoose from 'mongoose';
import paramSubModel from './param.submodel';

const Schema = mongoose.Schema;

const productModel = new Schema({
  name: { type: String, required: true },
  seller: { type: Schema.Types.ObjectId, required: true, ref: 'Seller' },
  price: { type: Number, required: true, min: 0 },
  category: { type: Schema.Types.ObjectId, required: true, ref: 'Category' },
  description: { type: String },
  product_imgs: { type: [String] },
  reviews: { type: [Schema.Types.ObjectId], ref: 'Review' },
  main_params: [paramSubModel],
  //   rating: { type: Number, min: 0, max: 5 },
  isPending: { type: Boolean, required: true },
  total_sales: { type: Number, required: true, min: 0 },
  total_reviews: { type: Number, required: true, min: 0 },
});

export default mongoose.model('Product', productModel);
