import express, { Request, Response } from 'express';
import { handleResponseError } from '../helpers';
import {
  User,
  IUser,
  IUserPost,
  IUserFilter,
  IUserSort,
  IListResponse,
  SEX,
  STATUS,
  IPagination,
} from '../models';
import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

const router = express.Router();

export const data = [
  {
    name: 'Alan',
    email: 'alan@mail.ru',
    age: 18,
    sex: SEX.MALE,
    status: STATUS.ENABLED,
  },
  {
    name: 'Bob',
    email: 'bob@mail.ru',
    age: 20,
    sex: SEX.MALE,
    status: STATUS.ENABLED,
  },
  {
    name: 'Celine',
    email: 'celine@mail.ru',
    age: 20,
    sex: SEX.FEMALE,
    status: STATUS.ENABLED,
  },
  {
    name: 'Fred',
    email: 'fred@mail.ru',
    age: 20,
    sex: SEX.MALE,
    status: STATUS.ENABLED,
  },
  {
    name: 'George',
    email: 'george@mail.ru',
    age: 20,
    sex: SEX.MALE,
    status: STATUS.ENABLED,
  },
];

router.get(
  '/generate',
  async function (req: Request<never, string, never, never>, res) {
    try {
      data.forEach(el => {
        const preModel = new User(el);
        preModel.password = '123123';
        preModel.save();
      });

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
      IListResponse<IUser>,
      never,
      IUserFilter & IPagination & IUserSort
    >,
    res
  ) {
    try {
      const cursor = User.find({});
      cursor.select('-password');

      const pageNumber = Number(req.query.pageNumber ?? 0);
      const pageSize = Number(req.query.pageSize ?? 12);
      cursor.skip(pageNumber * pageSize).limit(pageSize);

      const sortDirection = req.query.sortDirection ?? 'asc';
      const sortField = req.query.sortField;
      if (sortField) {
        cursor.sort({ [sortField]: sortDirection });
      }

      const { id, name, email, age, sex, status } = req.query;
      if (id) {
        cursor.where('_id').equals(id);
      }
      if (name) {
        cursor
          .where('name')
          .equals({ $regex: '.*' + name + '.*', $options: 'i' });
      }
      if (email) {
        cursor
          .where('email')
          .equals({ $regex: '.*' + email + '.*', $options: 'i' });
      }
      if (age) {
        cursor.where('age').equals(age);
      }
      if (sex) {
        cursor.where('sex').equals(sex);
      }
      if (status) {
        cursor.where('age').equals(status);
      }

      const list = await cursor;

      const cursorCount = User.find({});
      cursorCount.where(cursor.getFilter());
      const count = await User.countDocuments(cursorCount);

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
  async function (req: Request<{ id: string }, IUser, never, {}>, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return handleResponseError(res, new Error('Bad format id'));
      }

      const model = await User.findById(id);
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

router.post(
  '/',
  async function (req: Request<never, IUser, IUserPost, never>, res) {
    try {
      const preModel = new User(req.body);
      const model = await preModel.save();
      res.send(model);
    } catch (error) {
      if (error instanceof Error) {
        handleResponseError(res, error);
      }
    }
  }
);

router.put(
  '/:id',
  async function (req: Request<{ id: string }, IUser, IUserPost, never>, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return handleResponseError(res, new Error('Bad format id'));
      }

      await User.findByIdAndUpdate(
        id,
        pick(req.body, ['name', 'email', 'age', 'sex', 'status'])
      );

      const model = await User.findById(id);
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
  async function (req: Request<{ id: string }, IUser, never, never>, res) {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return handleResponseError(res, new Error('Bad format id'));
      }

      const deletedModel = await User.findByIdAndDelete(id);
      res.send(deletedModel!);
    } catch (error) {
      if (error instanceof Error) {
        handleResponseError(res, error);
      }
    }
  }
);

export default router;
