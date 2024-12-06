import { sellerSchema } from '../models/seller.model';
// import buyerModel from '../models/buyer.model';
// import managerModel from "../models/manager.model";

interface AccountTypes {
  SELLER: string;
  BUYER: string;
  MANAGER: string;
  ALL: string[];
  ModelArgs: {
    Seller: [string, typeof sellerSchema];
    // Buyer: typeof buyerModel;
  };
  //   Seller: typeof sellerModel;
}

const accountTypes: AccountTypes = {
  SELLER: 'Seller',
  BUYER: 'Buyer',
  MANAGER: 'Manager',
  ALL: ['Seller', 'Buyer', 'Manager'],
  ModelArgs: { Seller: ['Seller', sellerSchema] },
};

export default accountTypes;
