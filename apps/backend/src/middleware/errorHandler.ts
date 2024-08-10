import Express from 'express';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../errors/index.js';

export const errorHandler = (err: unknown, _req: Express.Request, res: Express.Response, _next: Express.NextFunction) => {
      switch (true) {
            case err instanceof UnauthorizedError:
                  res.send(401);
                  break;

            case err instanceof NotFoundError:
                  res.sendStatus(404);
                  break;

            case err instanceof BadRequestError:
                  res.status(400).send(err.message);
                  break;

            case err instanceof ConflictError:
                  res.sendStatus(409);
                  break;

            case err instanceof ForbiddenError:
                  res.sendStatus(403);
                  break;

            default:
                  console.error(err);
                  res.sendStatus(500);
      }
}
