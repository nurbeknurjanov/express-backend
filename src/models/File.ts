import mongoose, { Schema, Types, Model } from 'mongoose';
import { ISort } from './types';
import { Product, IProduct } from './Product';
import fsPromise from 'node:fs/promises';

export interface IFile {
  _id: Types.ObjectId;
  modelName: 'Product';
  modelId: Types.ObjectId;
  data: {
    type: 'image';
  };

  ext: string;
  originalFileName: string;

  url: string;
  model: IProduct;
}

type IFileWithoutSystemFields = Omit<IFile, '_id' | 'url' | 'model'>;
export interface IFilePost extends IFileWithoutSystemFields {}
export interface IFileFilter extends Partial<IFileWithoutSystemFields> {
  id?: string;
  type?: string;
  modelSearch?: string;
}
export type IFileSortFields = keyof IFileWithoutSystemFields;
export interface IFileSort extends ISort<IFileSortFields> {}

interface FileModel extends Model<IFile, {}> {}

const schema = new Schema<IFile, FileModel>(
  {
    modelName: String,
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    data: {
      type: {
        type: String,
        //lowercase: true,
        trim: true,
      },
    },
    //data: Object,
    ext: String,
    originalFileName: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    virtuals: {
      url: {
        get(this: IFile): string {
          if (process.env.NODE_ENV === 'development') {
            return `${process.env.BACKEND_URL}/images/${this._id}.${this.ext}`;
          }

          return `${process.env.AWS_URL}/${this._id}.${this.ext}`;
        },
      },
      model: {
        get(this: Omit<IFile, 'modelId'> & { modelId: IProduct }): IProduct {
          return this.modelId;
        },
      },
    },
  }
);

/*fileSchema.pre('save', async function (next) {
  const doc = this;
  const count = await File.countDocuments();
  doc.assetId = count + 1;
});*/

//sync to update product
schema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    const doc = this;

    try {
      if (doc.modelId && doc.modelName === 'Product') {
        await Product.findByIdAndUpdate(doc.modelId, {
          //[deletedModel!.data.type]: null,
          $unset: { imageId: 1 },
        });
      }

      if (process.env.NODE_ENV === 'development') {
        await fsPromise.unlink(
          `${__dirname}/../../public/images/${doc._id}.${doc.ext}`
        );
      }
    } catch (err) {
      //next(err);
      return new Promise((resolve, reject) => {
        reject(err);
      });
    }
  }
);

//on create file on product update
//sync to product
schema.pre('save', async function (next) {
  const doc = this;
  try {
    if (doc.isNew && doc.modelName === 'Product' && doc.modelId) {
      await Product.findByIdAndUpdate(doc.modelId, {
        imageId: doc._id,
      });
      return next();
    }
  } catch (err) {
    //next(err);
    return new Promise((resolve, reject) => {
      reject(err);
    });
  }
});

export const File = mongoose.model<IFile, FileModel>('File', schema);
