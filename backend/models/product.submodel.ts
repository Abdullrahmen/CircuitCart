import { Schema } from 'mongoose';
import { paramValidator } from './param.submodel';
import STATUS from '../utils/statusTypes';

const paramSubModel = new Schema(
  {
    name: { type: String, required: true },
    ordered: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const productSubModel = new Schema(
  {
    id: { type: Schema.Types.ObjectId, required: true },
    seller: { type: Schema.Types.ObjectId, required: true },
    category_params: {
      type: [paramSubModel],
      required: true,
      validate: {
        validator: paramValidator,
        message: 'category_params must be an array of unique objects',
      },
    },
    other_params: {
      type: [paramSubModel],
      validate: {
        validator: paramValidator,
        message: 'other_params must be an array of unique objects',
      },
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
    review: { type: Schema.Types.ObjectId, ref: 'Review' },
    status: {
      type: String,
      enum: STATUS.PRODUCT.ALL,
      required: true,
      default: STATUS.PRODUCT.PENDING,
    },
  },
  { _id: false }
);

export { productSubModel };
