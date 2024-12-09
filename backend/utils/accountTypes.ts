/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  sellerSchema,
  buyerSchema,
  managerSchema,
} from '../models/users.models';
// import { buyerSchema } from '../models/buyer.model';
// import managerModel from "../models/manager.model";

interface AccountTypes {
  SELLER: string;
  BUYER: string;
  MANAGER: string;
  ALL: string[];
  ModelArgs: {
    Seller: [string, typeof sellerSchema];
    Buyer: [string, typeof buyerSchema];
    Manager: [string, typeof managerSchema];
  };
}

// Make it better -TODO
// Note that the value of the SELLER key must be the same as the name of the modelArgs.Seller
const accountTypes: AccountTypes = {
  SELLER: 'Seller',
  BUYER: 'Buyer',
  MANAGER: 'Manager',
  ALL: ['Seller', 'Buyer', 'Manager'],
  ModelArgs: {
    Seller: ['Seller', sellerSchema],
    Buyer: ['Buyer', buyerSchema],
    Manager: ['Manager', buyerSchema],
  },
};

export default accountTypes;
