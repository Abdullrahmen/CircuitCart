import mongoose from 'mongoose';
import types from '../utils/paramsTypes';

const Schema = mongoose.Schema;

const paramSubModel = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: types.ALL, required: true },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

paramSubModel.pre('save', function (next) {
  if (String(typeof this.content) !== this.type) {
    return next(
      new Error(
        `Content type must be ${this.type} and it's ${String(
          typeof this.content
        )}`
      )
    );
  }

  next();
});
export default paramSubModel;
