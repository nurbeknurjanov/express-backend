import mongoose, { Schema, Model, Types } from 'mongoose';
import { ISort } from './types';
import { File, IFile } from './File';

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  description: string;

  imageId?: Types.ObjectId;
  image?: IFile;
}

type IProductWithoutSystemFields = Omit<IProduct, '_id' | 'image'>;
export interface IProductPost extends IProductWithoutSystemFields {}
export interface IProductFilter extends Partial<IProductWithoutSystemFields> {
  id?: string;
}
export type IProductSortFields = keyof IProductWithoutSystemFields;
export interface IProductSort extends ISort<IProductSortFields> {}

interface ProductModel extends Model<IProduct, IProduct> {}

const schema = new Schema<IProduct, ProductModel>(
  {
    name: String,
    description: String,

    imageId: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    virtuals: {
      image: {
        get(this: Omit<IProduct, 'imageId'> & { imageId: IFile }): IFile {
          return this.imageId;
        },
      },
    },
  }
);

//on product create
schema.post('validate', async function (doc) {
  try {
    //doc.image is string, the ID of first created File
    if (doc.isNew && doc.imageId) {
      await File.findByIdAndUpdate(doc.imageId, {
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
      if (doc.imageId) {
        const fileModel = await File.findById(doc.imageId);
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
