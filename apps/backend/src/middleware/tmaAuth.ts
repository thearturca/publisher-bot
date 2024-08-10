import { Handler, Response } from 'express'
import { UnauthorizedError } from '../errors/index.js';
import { validate, parse, type InitDataParsed } from '@telegram-apps/init-data-node';

export const tmaAuth: (tgToken: string) => Handler = (tgToken: string) => {
      return (req, res, next) => {
            const auth = req.headers.authorization;

            if (!auth)
                  throw new UnauthorizedError();

            const [type, rawInitData] = auth.split(' ');

            if (type !== 'tma')
                  throw new UnauthorizedError();

            if (!rawInitData)
                  throw new UnauthorizedError();

            try {
                  if (process.env.NODE_ENV !== "development")
                        validate(rawInitData, tgToken, {
                              expiresIn: 3600 // 1 hour
                        });

                  setInitData(res, parse(rawInitData));
            } catch (err) {
                  console.error(err);
                  throw new UnauthorizedError();
            }

            return next();
      }
};

export function setInitData(res: Response, initData: InitDataParsed): void {
      res.locals.initData = initData;
}

export function getInitData(res: Response): InitDataParsed | undefined {
      return res.locals.initData;
}
