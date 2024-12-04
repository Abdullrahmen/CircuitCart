import mongoose from 'mongoose';
import paramSubModel from './param.submodel';

const Schema = mongoose.Schema;

const productSubModel = new Schema(
  {
    product: { type: Schema.Types.ObjectId, required: true },
    main_params: [paramSubModel],
    quantity: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderModel = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
  products: { type: [productSubModel], required: true },
  total_price: { type: Number, required: true, min: 0 },
  isCompleted: { type: Boolean, required: true },
  review: { type: Schema.Types.ObjectId, ref: 'Review' },
  date: { type: Schema.Types.Date, required: true },
});

export default mongoose.model('Order', orderModel);
