import mongoose, { Schema, Types, Model } from 'mongoose';
import { ISort } from './types';
import { Product, IProduct } from './Product';
import fsPromise from 'node:fs/promises';

export interface IFile {
  _id: Types.ObjectId;
  modelName: 'Product';
  modelId: Types.ObjectId | IProduct;
  data: {
    type: 'image';
  };

  ext: string;
  originalFileName: string;
  url: string;
}

type IFileWithout_id = Omit<IFile, '_id'>;
export interface IFilePost extends IFileWithout_id {}
export interface IFileFilter extends IFileWithout_id {
  id: string;
  type: string;
}
export type IFileSortFields = keyof IFileWithout_id;
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

          return `${process.env.AWS_URL}/${this._id}`;
        },
      },
      model: {
        get(this: IFile): IProduct {
          return this.modelId as IProduct;
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
      if (doc.modelId && doc.modelName === 'Product' && doc.data?.type) {
        await Product.findByIdAndUpdate(doc.modelId, {
          //[deletedModel!.data.type]: null,
          $unset: { [doc.data.type]: 1 },
        });
      }

      await fsPromise.unlink(
        `${__dirname}/../../public/images/${doc._id}.${doc.ext}`
      );
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
    if (
      doc.isNew &&
      doc.modelName === 'Product' &&
      doc.modelId &&
      doc.data?.type
    ) {
      await Product.findByIdAndUpdate(doc.modelId, {
        [doc.data.type]: doc._id,
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
