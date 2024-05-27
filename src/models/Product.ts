import mongoose, { Schema, Model, Types } from 'mongoose';
import { IPagination, ISort } from './types';

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  image: Types.ObjectId;
}

export interface IProductPost extends Omit<IProduct, '_id'> {}
interface IProductFilter extends IPagination {}
interface IProductFilter extends ISort<Omit<IProduct, '_id'>> {}
interface IProductFilter extends Omit<IProduct, '_id'> {
  id: string;
}
export { IProductFilter };

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
