import express, { Request, Express } from 'express';
import { handleResponseError } from '../helpers';
import {
  File,
  IFile,
  IFilePost,
  IFileFilter,
  IFileSort,
  IListResponse,
  Product,
  IPagination,
} from '../models';
import { ObjectId } from 'mongodb';
import multer from 'multer';
import fsPromise from 'node:fs/promises';
import fs from 'fs';
import AWS from 'aws-sdk';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
//import * as process from 'process';
const client = new S3Client({
  region: process.env.AWS_REGION,
});

/*AWS.config.credentials = new AWS.Credentials(
  process.env.AWS_ACCESS_KEY_ID!,
  process.env.AWS_SECRET_ACCESS_KEY!
);*/

/*AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});*/

/*const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
});*/

//const s3 = new AWS.S3();

// AWS credentials are picked up from the environment

const router = express.Router();

const storage = multer.diskStorage({
  /*destination: (_req, _file, cb) => {
    cb(null, './tmp');
  },*/
  /*filename: (req, file, cb)=>{
        cb(null, file.originalname);
    }*/
});
export const upload = multer();
//export const upload = multer({ storage });
//router.use('/upload', upload.single('fileField')); //тогда будет req.file
router.use('/upload', upload.fields([{ name: 'fileField', maxCount: 1 }]));

router.post(
  '/upload',
  async function (req: Request<never, IFile, IFilePost, never>, res) {
    try {
      const files = req.files as {
        fileField: Express.Multer.File[];
      };

      if (files?.fileField?.[0]) {
        const {
          originalname,
          //mimetype: 'image/png',
          //filename,//nodejs generated file name hashed
          path,
          //size,//bytes
          //destination,
          buffer,
        } = files.fileField[0];

        const preModel = new File({
          ext: originalname.split('.').pop() || 'jpg',
          originalFileName: originalname,
        });

        //data on product update
        preModel.modelName = req.body.modelName ?? null;
        preModel.modelId = req.body.modelId ?? null;

        preModel.data =
          typeof req.body.data === 'string'
            ? JSON.parse(req.body.data)
            : req.body.data;

        const model = await preModel.save();

        if (process.env.NODE_ENV === 'development') {
          /*await fsPromise.rename(
            path,
            `${__dirname}/../../public/images/${model._id}.${model.ext}`
          );*/
          await fsPromise.writeFile(
            `${__dirname}/../../public/images/${model._id}.${model.ext}`,
            buffer
          );
        } else {
          const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: model._id.toString(),
            Body: buffer,
            //Body: fs.createReadStream(path),
          });
          await client.send(command);
        }

        return res.send(model);
      }

      res.end(null);
    } catch (error) {
      if (error instanceof Error) {
        handleResponseError(res, error);
      }
    }
  }
);

router.get(
  '/',
  async function (
    req: Request<
      never,
      IListResponse<IFile>,
      never,
      IFileFilter & IPagination & IFileSort
    >,
    res
  ) {
    try {
      const pageNumber = Number(req.query.pageNumber ?? 0);
      const pageSize = Number(req.query.pageSize ?? 12);

      const cursor = File.find({});
      cursor.skip(pageNumber * pageSize).limit(pageSize);

      const { modelName, id } = req.query;
      if (modelName) {
        cursor.where('modelName').equals(modelName);
      }
      if (id) {
        cursor.where('_id').equals(id);
      }

      const list = await cursor;
      const count = await File.countDocuments();

      res.send({
        list,
        pagination: {
          pageNumber,
          pageSize,
          total: count,
          pageCount: Math.ceil(count / pageSize),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        handleResponseError(res, error);
      }
    }
  }
);

router.get(
  '/:id',
  async function (req: Request<{ id: string }, IFile, never, {}>, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return handleResponseError(res, new Error('Bad format id'));
      }
      const model = await File.findById(id);
      if (!model) {
        return handleResponseError(res, new Error('File not found'));
      }

      res.send(model!);
    } catch (error) {
      if (error instanceof Error) {
        handleResponseError(res, error);
      }
    }
  }
);

router.delete(
  '/:id',
  async function (req: Request<{ id: string }, IFile, never, never>, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return handleResponseError(res, new Error('Bad format id'));
      }

      const deletedModel = await File.findById(id);
      await deletedModel!.deleteOne();

      res.send(deletedModel!);
    } catch (error) {
      if (error instanceof Error) {
        handleResponseError(res, error);
      }
    }
  }
);

export default router;
