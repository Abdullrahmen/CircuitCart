import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  review: String,
  rating: { type: Number, min: 0, max: 5, required: true },
  quantity: { type: Number, required: true },
});
const reviewModel = mongoose.model('Review', reviewSchema);

export { reviewModel, reviewSchema };
