import mongoose, { Schema, Types, Model } from 'mongoose';
import { IPagination } from './types';

export interface IFile {
  _id: string;
  modelName: 'Product';
  modelId: Types.ObjectId;
  data: {
    type: 'image';
  };

  ext: string;
  originalFileName: string;
  url: string;
}
export interface IFilePost extends Omit<IFile, '_id'> {}
interface IFileFilter extends IPagination {}
interface IFileFilter extends Omit<IFile, '_id'> {
  id: string;
}
export { IFileFilter };

interface FileModel extends Model<IFile, {}> {}

const schema = new Schema<IFile, FileModel>(
  {
    modelName: String,
    modelId: Schema.Types.ObjectId,
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
    },
  }
);

/*fileSchema.pre('save', async function (next) {
  const doc = this;
  const count = await File.countDocuments();
  doc.assetId = count + 1;
});*/

export const File = mongoose.model<IFile, FileModel>('File', schema);
