import mongoose, { Schema, Model, Types } from 'mongoose';
import { IPagination, ISort } from './types';

export enum SEX {
  MALE = 1,
  FEMALE = 0,
}

export enum STATUS {
  ENABLED = 1,
  DISABLED = 0,
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  sex: SEX;
  status: STATUS;
}

export interface IUserPost extends Omit<IUser, '_id'> {}
interface IUserFilter extends IPagination {}
interface IUserFilter extends ISort<Omit<IUser, '_id'>> {}
interface IUserFilter extends Omit<IUser, '_id'> {
  id: string;
}
export { IUserFilter };

interface UserModel extends Model<IUser, IUser> {}

const schema = new Schema<IUser, UserModel>(
  {
    name: String,
    email: String,
    password: String,
    age: Number,
    sex: {
      type: Number,
      enum: [SEX.MALE, SEX.FEMALE],
    },
    status: {
      type: Number,
      enum: [STATUS.ENABLED, STATUS.DISABLED],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser, UserModel>('User', schema);
