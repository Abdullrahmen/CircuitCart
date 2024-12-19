import mongoose from 'mongoose';
import STATUS from '../utils/statusTypes';
import { productSubModel } from './product.submodel';
import { isUnique } from '../utils/array';
const Schema = mongoose.Schema;

const orderModel = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
  products: {
    type: [productSubModel],
    required: true,
    validate: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: (v: any[]) =>
        Array.isArray(v) &&
        v.length > 0 &&
        v.map((e) => e.id.toString()).every(isUnique),
      message: 'Products must be an array of unique objects',
    },
  },
  total_price: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: STATUS.ORDER.ALL,
    required: true,
    default: STATUS.ORDER.AWAITING_PRODUCTS_RECEPTION,
  },
  date: { type: Schema.Types.Date, required: true },
});

export default mongoose.model('Order', orderModel);
