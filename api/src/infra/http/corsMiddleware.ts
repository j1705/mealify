import { NextFunction, Request, Response } from "express";

const ALLOWED_METHODS = "GET,POST,PUT,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Content-Type";
const NO_CONTENT = 204;

export function corsMiddleware(allowedOrigin: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
    res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.sendStatus(NO_CONTENT);
      return;
    }
    next();
  };
}
