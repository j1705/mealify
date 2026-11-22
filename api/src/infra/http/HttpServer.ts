import express, { Express, NextFunction, Request, Response } from "express";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import BadRequestError from "./BadRequestError";
import { corsMiddleware } from "./corsMiddleware";
import { DEFAULT_CORS_ORIGIN } from "./ServerConfig";
import { respondWithError } from "./respondWithError";

export type HttpMethod = "get" | "post" | "put" | "delete";
export type HttpParams = Record<string, string>;
export type HttpQuery = Record<string, string>;
export type HttpCallback = (
  params: HttpParams,
  body: unknown,
  query: HttpQuery,
) => Promise<unknown>;

export type RunningServer = {
  port: number;
  close(): Promise<void>;
};

export default interface HttpServer {
  register(method: HttpMethod, url: string, callback: HttpCallback, statusCode?: number): void;
  listen(port: number): Promise<RunningServer>;
}

export class ExpressAdapter implements HttpServer {
  private app: Express;
  private routesClosed = false;

  constructor(allowedOrigin = DEFAULT_CORS_ORIGIN) {
    this.app = express();
    this.app.use(corsMiddleware(allowedOrigin));
    this.app.use(express.json());
  }

  register(method: HttpMethod, url: string, callback: HttpCallback, statusCode = 200): void {
    if (this.routesClosed) throw new Error("Routes must be registered before listen");
    this.app[method](url, async (req: Request, res: Response) => {
      try {
        const output = await callback(
          req.params as HttpParams,
          req.body,
          requireSingleValuedQuery(req.query),
        );
        res.status(statusCode).json(output);
      } catch (error) {
        respondWithError(res, error);
      }
    });
  }

  async listen(port: number): Promise<RunningServer> {
    this.registerHandlersForWhatNoRouteHandled();

    const server = await new Promise<Server>((resolve, reject) => {
      const listening = this.app.listen(port, (error?: Error) =>
        error ? reject(error) : resolve(listening),
      );
    });
    return {
      port: (server.address() as AddressInfo).port,
      close: () =>
        new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        ),
    };
  }

  private registerHandlersForWhatNoRouteHandled() {
    if (this.routesClosed) return;
    this.routesClosed = true;
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ message: "Route not found" });
    });
    this.app.use(handleErrorRaisedBeforeAnyRoute);
  }
}

function handleErrorRaisedBeforeAnyRoute(
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  respondWithError(res, error);
}

function requireSingleValuedQuery(query: Request["query"]): HttpQuery {
  const result: HttpQuery = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== "string") throw new BadRequestError(`Repeated query parameter: ${key}`);
    result[key] = value;
  }
  return result;
}
