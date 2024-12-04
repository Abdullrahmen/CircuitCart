import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const reviewModel = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  review: String,
  rating: { type: Number, min: 0, max: 5, required: true },
  // quantity: { type: Number, required: true },
});

export default mongoose.model('Review', reviewModel);
