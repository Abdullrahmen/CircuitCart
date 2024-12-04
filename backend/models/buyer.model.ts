import mongoose from 'mongoose';
import userSubModel from './user.submodel';

const Schema = mongoose.Schema;

const buyerModel = new Schema({
  orders: { type: [Schema.Types.ObjectId], ref: 'Order' },
  reviews: { type: [Schema.Types.ObjectId], ref: 'Review' },
  user: { type: userSubModel, required: true },
});

export default mongoose.model('Buyer', buyerModel);
