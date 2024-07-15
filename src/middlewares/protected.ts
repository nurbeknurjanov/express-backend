import { Request, Response, NextFunction } from 'express';
import { JWT } from '../helpers/JWT';

export const hasRefreshToken = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    res.status(403).send('Refresh token is missing');
  }

  try {
    const payload = JWT.parseToken(refreshToken);
    if (new Date(payload.expire).getTime() < new Date().getTime()) {
      return res.status(403).send(payload.type + ' is expired');
    }

    return next();
  } catch (e) {
    return res.status(403).send('Refresh token is wrong');
  }

  //res.status(403).end('Forbidden')
  //res.redirect('/error');
};

export const isAuthorized = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization, cookie: _cookieString } = req.headers;
  const _accessToken = authorization?.replace('Bearer ', '');

  const { accessToken } = req.cookies;

  if (!accessToken) {
    res.status(401).send('Access token is missing');
  }

  try {
    const payload = JWT.parseToken(accessToken);
    if (new Date(payload.expire).getTime() < new Date().getTime()) {
      return res.status(401).send(payload.type + ' is expired');
    }

    return next();
  } catch (e) {
    //res.status(401).end('Access token is wrong');
    return res.status(401).send('Access token is wrong');
  }

  //throw new Error('Not authorized')
  /*return res.status(401).send({
        code: 4001,
        message: 'This is an error!',
    });*/
  //res.status(403).end('Forbidden')
  //res.redirect('/error');
};
