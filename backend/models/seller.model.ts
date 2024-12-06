import mongoose from 'mongoose';
import userSubModel from './user.submodel';

const Schema = mongoose.Schema;

const sellerSchema = new Schema({
  products: { type: [Schema.Types.ObjectId], ref: 'Product' },
  pendings: { type: [Schema.Types.ObjectId], ref: 'Product' },
  user: { type: userSubModel, required: true },
  isGuaranteed: { type: Boolean, required: true },
});

const sellerModel = mongoose.model('Seller', sellerSchema);

export { sellerModel, sellerSchema };
