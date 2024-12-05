import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
export interface ITokenRequest extends Request {
  jwt_data?: JwtPayload;
}
