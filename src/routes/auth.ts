import express, { Request, Response, NextFunction } from 'express';
import { isAuthorized, isGuest, hasRefreshToken } from '../middlewares';
import { JWT } from '../helpers/JWT';
import { User } from '../models';

const router = express.Router();

router
  .use('/get-access-token', hasRefreshToken)
  .get('/get-access-token', function (req: Request<{}, {}, {}, {}>, res) {
    const { authorization, cookie: _cookieString } = req.headers;
    const _accessToken = authorization?.replace('Bearer ', '');
    const { refreshToken } = req.cookies;

    try {
      const payload = JWT.parseToken(refreshToken);
      const accessToken = JWT.generateToken(
        {
          type: 'access-token',
          user: payload.user,
        },
        10000 * 10 * 60 * 1000
      ); //10 min

      res.send(accessToken);
    } catch (e) {
      res.status(401).send('Token is wrong');
    }
  });

router
  .use('/user', isAuthorized)
  .get('/user', function (req: Request<{}, {}, {}, {}>, res) {
    res.json('Welcome user');
  });

router
  .use('/guest', isGuest)
  .get('/guest', function (req: Request<{}, {}, {}, {}>, res) {
    res.json('Welcome guest');
  });

router.post(
  '/login',
  async function (
    req: Request<
      {},
      string,
      {
        email: string;
        password: string;
      },
      {}
    >,
    res: Response,
    next: NextFunction
  ) {
    const cursor = User.findOne({ email: req.body.email });
    cursor.where('password').equals(req.body.password);
    const user = await cursor;
    if (!user) {
      return res.status(404).send('The credential are wrong');
    }

    const refreshToken = JWT.generateToken(
      {
        type: 'refresh-token',
        user,
      },
      7 * 24 * 60 * 60 * 1000
    ); //week

    res.send(refreshToken);
  }
);

export default router;
