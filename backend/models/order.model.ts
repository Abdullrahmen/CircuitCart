import mongoose from 'mongoose';
import STATUS from '../utils/statusTypes';
import { productSubModel } from './product.submodel';
const Schema = mongoose.Schema;

const orderModel = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
  products: { type: [productSubModel], required: true },
  total_price: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: STATUS.ORDER.ALL,
    required: true,
    default: STATUS.ORDER.PENDING,
  },
  date: { type: Schema.Types.Date, required: true },
});

export default mongoose.model('Order', orderModel);
