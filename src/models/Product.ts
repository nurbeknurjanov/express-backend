import mongoose, { Schema, Model, Types } from 'mongoose';
import { ISort } from './types';
import { File } from './File';
import fsPromise from 'node:fs/promises';

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

//on product create
schema.post('validate', async function (doc) {
  try {
    //doc.image is string, the ID of first created File
    if (doc.isNew && doc.image) {
      await File.findByIdAndUpdate(doc.image, {
        modelId: doc._id,
        modelName: 'Product',
      });
    }
  } catch (err) {
    //next(err);
    return new Promise((resolve, reject) => {
      reject(err);
    });
  }
});

//sync to file
schema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const doc = this;

    try {
      if (doc.image) {
        const fileModel = await File.findById(doc.image);
        if (fileModel) {
          await fileModel.deleteOne();
        }
      }
    } catch (err) {
      next(err as Error);
    }
  }
);

export const Product = mongoose.model<IProduct, ProductModel>(
  'Product',
  schema
);
