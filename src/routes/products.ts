import express, { Request, Response } from 'express';
import { handleResponseError } from '../helpers';
import {
  Product,
  IProduct,
  IProductPost,
  IListResponse,
  IPagination,
  IProductFilter,
  IProductSort,
  File,
} from '../models';
import { ObjectId } from 'mongodb';
import { isAuthorized } from '../middlewares';

const router = express.Router();

router.get(
  '/generate',
  async function (req: Request<never, string, never, never>, res) {
    try {
      await File.deleteMany({});
      await Product.deleteMany({});

      for (let i = 0; i <= 48; i++) {
        const preModel = new Product({ name: 'Product ' + i, description: '' });
        const model = await preModel.save();
      }

      res.send('Generated');
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
      IListResponse<IProduct>,
      never,
      IPagination & IProductFilter & IProductSort
    >,
    res
  ) {
    try {
      const cursor = Product.find({});
      cursor.populate({
        path: 'imageId',
        select: 'url data.type ext',
        /*match: {
            name: { $eq: 'Avril Lavigne' },
          },*/
      });

      const pageNumber = Number(req.query.pageNumber ?? 0);
      const pageSize = Number(req.query.pageSize ?? 12);
      cursor.skip(pageNumber * pageSize).limit(pageSize);

      const sortDirection = req.query.sortDirection ?? 'asc';
      const sortField = req.query.sortField;
      if (sortField) {
        cursor.sort({ [sortField]: sortDirection });
      }

      const { id, name, description } = req.query;
      if (id) {
        cursor
          .where('_id')
          .equals(ObjectId.isValid(id) ? new ObjectId(id) : id);
      }
      if (name) {
        cursor
          .where('name')
          .equals({ $regex: '.*' + name + '.*', $options: 'i' });
      }
      if (description) {
        cursor
          .where('description')
          .equals({ $regex: '.*' + description + '.*', $options: 'i' });
      }

      const list = await cursor;

      const cursorCount = Product.find({});
      cursorCount.where(cursor.getFilter());
      const count = await Product.countDocuments(cursorCount);

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
  async function (req: Request<{ id: string }, IProduct, never, {}>, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return handleResponseError(res, new Error('Bad format id'));
      }

      const model = await Product.findById(id).populate({
        path: 'imageId',
        select: 'url data.type ext',
      });
      if (!model) {
        return handleResponseError(res, new Error('Product not found'));
      }

      res.send(model!);
    } catch (error) {
      if (error instanceof Error) {
        handleResponseError(res, error);
      }
    }
  }
);

router
  .use('/', isAuthorized)
  .post(
    '/',
    async function (req: Request<never, IProduct, IProductPost, never>, res) {
      try {
        const preModel = new Product(req.body);
        const model = await preModel.save();

        res.send(model);
      } catch (error) {
        if (error instanceof Error) {
          handleResponseError(res, error);
        }
      }
    }
  );

router
  .use('/:id', isAuthorized)
  .put(
    '/:id',
    async function (
      req: Request<{ id: string }, IProduct, IProductPost, never>,
      res
    ) {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return handleResponseError(res, new Error('Bad format id'));
        }

        const model = await Product.findById(id);
        Object.entries(req.body).forEach(([key, value]) => {
          //@ts-ignore
          model[key] = value;
        });
        model!.save();

        res.send(model!);
      } catch (error) {
        if (error instanceof Error) {
          handleResponseError(res, error);
        }
      }
    }
  );

router
  .use('/:id', isAuthorized)
  .delete(
    '/:id',
    async function (req: Request<{ id: string }, IProduct, never, never>, res) {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return handleResponseError(res, new Error('Bad format id'));
        }

        const model = await Product.findById(id);
        if (model) {
          await model!.deleteOne();
        }

        res.send(model!);
      } catch (error) {
        if (error instanceof Error) {
          handleResponseError(res, error);
        }
      }
    }
  );

export default router;
