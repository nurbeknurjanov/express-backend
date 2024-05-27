import { Request, Response, NextFunction } from 'express';
import { JWT } from '../helpers/JWT';

export const isGuest = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization, cookie: _cookieString } = req.headers;
  const _accessToken = authorization?.replace('Bearer ', '');

  const { accessToken } = req.cookies;

  if (!accessToken) {
    return next();
  }

  if (accessToken) {
    try {
      const payload = JWT.parseToken(accessToken);
      if (new Date(payload.expire).getTime() < new Date().getTime()) {
        return next();
      }

      return res.status(406).end('You are authorized');
    } catch (e) {
      return next();
    }
  }
};
