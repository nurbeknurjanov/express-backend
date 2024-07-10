import mongoose, { Schema, Model, Types } from 'mongoose';
import { ISort } from './types';

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
type IUserWithout_id = Omit<IUser, '_id'>;
export interface IUserPost extends IUserWithout_id {}
export interface IUserFilter extends IUserWithout_id {
  id: Types.ObjectId;
}
export type IUserSortFields = keyof IUserWithout_id;
export interface IUserSort extends ISort<IUserSortFields> {}

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
