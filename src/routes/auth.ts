import express, { Request, Response, NextFunction } from 'express';
import { hasRefreshToken } from '../middlewares';
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
          type: 'accessToken',
          user: payload.user,
        },
        10 * 1000
      ); //1 min

      res.send(accessToken);
    } catch (e) {
      console.log('Error on getting new access token', (e as Error).message);
      res.status(401).send('Refresh token is wrong');
    }
  });

router.post(
  '/login',
  async function (
    req: Request<
      {},
      { refreshToken: string; accessToken: string },
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
    cursor.select('-password');
    cursor.where('password').equals(req.body.password);
    const user = await cursor;
    if (!user) {
      return res.status(404).send('The credential are wrong');
    }

    const refreshToken = JWT.generateToken(
      {
        type: 'refreshToken',
        user,
      },
      7 * 24 * 60 * 60 * 1000
    ); //week

    const accessToken = JWT.generateToken(
      {
        type: 'accessToken',
        user,
      },
      10 * 1000
    ); //1 minute

    return res.send({ refreshToken, accessToken });
  }
);

export default router;
