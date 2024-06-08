import mongoose, { Schema, Model, Types } from 'mongoose';
import { ISort } from './types';

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  image: Types.ObjectId;
}

type IProductWithout_id = Omit<IProduct, '_id'>;
export interface IProductPost extends IProductWithout_id {}
export interface IProductFilter extends IProductWithout_id {
  id: string;
}
export type IProductSortFields = keyof IProductWithout_id;
export interface IProductSort extends ISort<IProductSortFields> {}

interface ProductModel extends Model<IProduct, IProduct> {}

const schema = new Schema<IProduct, ProductModel>(
  {
    name: String,
    description: String,
    image: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct, ProductModel>(
  'Product',
  schema
);
