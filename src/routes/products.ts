import express, { Request, Response } from 'express';
import { handleResponseError } from '../helpers';
import {
  Product,
  IProduct,
  IListResponse,
  IProductFilter,
  IProductPost,
  File,
} from '../models';
import { ObjectId } from 'mongodb';
import { isAuthorized } from '../middlewares';

const router = express.Router();

router.get(
  '/generate',
  async function (req: Request<never, string, never, never>, res) {
    try {
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
    req: Request<never, IListResponse<IProduct>, never, IProductFilter>,
    res
  ) {
    try {
      const cursor = Product.find({});
      cursor.populate('image', 'url data.type');

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
        cursor.where('_id').equals(id);
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
      const count = await Product.countDocuments();

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

      const model = await Product.findById(id);
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

        if (model.image) {
          await File.findByIdAndUpdate(model.image, {
            modelId: model._id,
            modelName: 'Product',
            data: {
              type: 'image',
            },
          });
        }

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

        await Product.findByIdAndUpdate(id, req.body);

        const model = await Product.findById(id);
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

        const deletedModel = await Product.findByIdAndDelete(id);
        res.send(deletedModel!);
      } catch (error) {
        if (error instanceof Error) {
          handleResponseError(res, error);
        }
      }
    }
  );

export default router;
