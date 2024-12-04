import mongoose from 'mongoose';
import validator from 'validator';
import usersTypes from '../utils/usersTypes';

const Schema = mongoose.Schema;
const userSubModel = new Schema(
  {
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true },
    },
    avatar: String,
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, 'Must be a valid email address'],
    },
    account_type: {
      type: String,
      enum: usersTypes.ALL,
      required: true,
    },
    password: { type: String, required: true },
    last_activity: { type: Schema.Types.Date },
    address: { type: String },
    created_at: { type: Schema.Types.Date },
    updated_at: { type: Schema.Types.Date },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    age: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

export default userSubModel;
