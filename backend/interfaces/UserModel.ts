import { Document } from 'mongoose';

interface User {
  user: {
    email: string;
    password: string;
  };
}

interface IUserModel extends Document {
  findOne: (query: object) => Promise<User | null>;
  find: (query: object) => Promise<User[]>;
}
export { IUserModel };
