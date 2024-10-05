import { Request, Response, NextFunction } from 'express';
import { JWT } from '../helpers/JWT';

export const hasRefreshToken = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  /*const refreshToken =
    req.headers['X-Refresh-Token'] || req.cookies.refreshToken;*/
  const refreshToken = req.headers['x-refresh-token'] as string;

  if (!refreshToken) {
    return res.status(403).send({ message: 'Refresh token is missing' });
  }

  try {
    const payload = JWT.parseToken(refreshToken);
    if (new Date(payload.expire).getTime() < new Date().getTime()) {
      return res.status(403).send({ message: payload.type + ' is expired' });
    }

    return next();
  } catch (e) {
    return res.status(403).send({ message: 'Refresh token is wrong' });
  }

  //res.status(403).end('Forbidden')
  //res.redirect('/error');
};

export const isAuthorized = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.url.includes('generate')) {
    return next();
  }

  const { authorization, cookie: _cookieString } = req.headers;
  const _accessToken = authorization?.replace('Bearer ', '');

  const accessToken = req.headers['x-access-token'] as string;
  if (!accessToken) {
    return res.status(401).send({ message: 'You are not authorized' });
  }

  try {
    const payload = JWT.parseToken(accessToken);
    if (new Date(payload.expire).getTime() < new Date().getTime()) {
      return res.status(401).send({ message: payload.type + ' is expired' });
    }

    return next();
  } catch (e) {
    return res.status(403).send({ message: 'Forbidden' });
  }

  //throw new Error('Not authorized')
  /*return res.status(401).send({
        code: 4001,
        message: 'This is an error!',
    });*/
  //res.status(403).end('Forbidden')
  //res.redirect('/error');
};

export const isAuthorizedOwn = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    req.method === 'POST' ||
    req.method === 'PUT' ||
    req.method === 'DELETE'
  ) {
    return isAuthorized(req, res, next);
  }

  return next();
};
