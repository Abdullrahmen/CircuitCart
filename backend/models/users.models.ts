import mongoose from 'mongoose';
import userSubModel from './user.submodel';

/*ALL THE SCHEMAS FOR THE USERS COLLECTIONS' THAT TAKE userSubModel as subDocument MUST BE HERE*/

const Schema = mongoose.Schema;

const sellerSchema = new Schema({
  products: { type: [Schema.Types.ObjectId], ref: 'Product' },
  pendings: { type: [Schema.Types.ObjectId], ref: 'Product' },
  user: { type: userSubModel, required: true },
  isGuaranteed: { type: Boolean, required: true },
});

const buyerSchema = new Schema({
  orders: { type: [Schema.Types.ObjectId], ref: 'Order' },
  reviews: { type: [Schema.Types.ObjectId], ref: 'Review' },
  user: { type: userSubModel, required: true },
});

const managerSchema = new Schema({
  user: { type: userSubModel, required: true },
  validations: { type: [Schema.Types.ObjectId], ref: 'Product' },
  privileges: { type: [String] }, // TODO: Define privileges
});

const buyerModel = mongoose.model('Buyer', buyerSchema);
const sellerModel = mongoose.model('Seller', sellerSchema);
const managerModel = mongoose.model('Manager', managerSchema);

export { buyerModel, buyerSchema };
export { sellerModel, sellerSchema };
export { managerModel, managerSchema };
