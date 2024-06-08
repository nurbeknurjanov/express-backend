import mongoose, { Schema, Types, Model } from 'mongoose';
import { ISort } from './types';

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

type IFileWithout_id = Omit<IFile, '_id'>;
export interface IFilePost extends IFileWithout_id {}
export interface IFileFilter extends IFileWithout_id {
  id: string;
}
export type IFileSortFields = keyof IFileWithout_id;
export interface IFileSort extends ISort<IFileSortFields> {}

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
