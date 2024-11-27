import express, { Request, Response, NextFunction } from 'express';
import { hasRefreshToken } from '../middlewares';
import { JWT } from '../helpers/JWT';
import { User } from '../models';

const router = express.Router();

router
  .use('/get-access-token', hasRefreshToken)
  .get('/get-access-token', async function (req: Request<{}, {}, {}, {}>, res) {
    const { authorization, cookie: _cookieString } = req.headers;
    const _accessToken = authorization?.replace('Bearer ', '');
    const refreshToken = req.headers['x-refresh-token'] as string;

    try {
      const payload = JWT.parseToken(refreshToken);
      const user = await User.findById(payload.user._id, { password: 0 });
      if (!user) {
        return res.status(403).send({ message: 'User not found' });
      }
      const accessToken = JWT.generateToken(
        {
          type: 'accessToken',
          user: user,
        },
        60 * 1000
      ); //1 min

      res.send(accessToken);
    } catch (e) {
      res.status(403).send({ message: 'Refresh token is wrong' });
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
      return res.status(404).send({ message: 'The credential are wrong' });
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

      60 * 1000
    ); //1 minute

    return res.send({ refreshToken, accessToken });
  }
);

export default router;
