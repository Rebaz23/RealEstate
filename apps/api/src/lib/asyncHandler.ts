import type { NextFunction, Request, Response } from "express";

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// Express 4 does not forward rejected promises from async handlers to error
// middleware, so an unhandled rejection takes down the whole process. This
// wrapper forwards any rejection to `next` so the global error handler
// returns a clean 500 instead of crashing the server.
export function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
