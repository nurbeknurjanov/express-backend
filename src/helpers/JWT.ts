import jwt from 'jsonwebtoken';
import { IUser } from '../models';

interface IPayload {
  user: IUser;
  expire: string;
  type: 'refresh-token' | 'access-token';
}

const secret_key: string = 'secret_key';

export class JWT {
  static parseToken(token: string): IPayload {
    return jwt.verify(token, secret_key) as IPayload;
  }
  static generateToken(
    payload: Omit<IPayload, 'expire'> & { expire?: IPayload['expire'] },
    milliseconds: number = 5 * 60 * 1000
  ): string {
    //5 minute
    payload.expire = new Date(new Date().getTime() + milliseconds).toString();
    return jwt.sign(payload, secret_key);
  }
}
