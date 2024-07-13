import { Request, Response, NextFunction } from 'express';
import { JWT } from '../helpers/JWT';

export const hasRefreshToken = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { refreshToken } = req.cookies;

  try {
    if (refreshToken) {
      const payload = JWT.parseToken(refreshToken);
      if (new Date(payload.expire).getTime() < new Date().getTime()) {
        return res.status(401).end(payload.type + ' is expired');
      }

      if (payload.type === 'refreshToken') {
        return next();
      }
    }
  } catch (e) {
    res.status(401).end('Token is wrong');
  }

  return res.status(401).end('Not authorized');
  //res.status(403).end('Forbidden')
  //res.redirect('/error');
};

export const isAuthorized = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  return next();

  const { authorization, cookie: _cookieString } = req.headers;
  const _accessToken = authorization?.replace('Bearer ', '');

  const { accessToken } = req.cookies;

  try {
    if (accessToken) {
      const payload = JWT.parseToken(accessToken);
      if (new Date(payload.expire).getTime() < new Date().getTime()) {
        return res.status(401).end(payload.type + ' is expired');
      }

      if (payload.type === 'accessToken') {
        return next();
      }
    }
  } catch (e) {
    res.status(401).end('Token is wrong');
  }

  //throw new Error('Not authorized')
  return res.status(401).send('Not authorized');
  /*return res.status(401).send({
        code: 4001,
        message: 'This is an error!',
    });*/
  //res.status(403).end('Forbidden')
  //res.redirect('/error');
};
