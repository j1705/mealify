import express, { Express, NextFunction, Request, Response } from "express";
import { Server } from "node:http";
import { AddressInfo } from "node:net";
import BadRequestError from "./BadRequestError";
import { parseCookies } from "./cookies";
import { corsMiddleware } from "./corsMiddleware";
import { DEFAULT_CORS_ORIGIN } from "./ServerConfig";
import { respondWithError } from "./respondWithError";

export type HttpMethod = "get" | "post" | "put" | "delete";
export type HttpParams = Record<string, string>;
export type HttpQuery = Record<string, string>;
export type HttpCookies = Record<string, string>;
export type HttpRequest = {
  params: HttpParams;
  body: unknown;
  query: HttpQuery;
  cookies: HttpCookies;
};

export type HttpCookie = {
  name: string;
  value: string;
  maxAgeSeconds: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict";
  path: string;
};

export class HttpResponse {
  constructor(
    readonly body: unknown,
    readonly cookies: HttpCookie[] = [],
  ) {}
}

const MS_PER_SECOND = 1000;
export type HttpCallback = (request: HttpRequest) => Promise<unknown>;

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
        const output = await callback({
          params: req.params as HttpParams,
          body: req.body,
          query: requireSingleValuedQuery(req.query),
          cookies: parseCookies(req.headers.cookie),
        });
        const response = output instanceof HttpResponse ? output : new HttpResponse(output);
        for (const cookie of response.cookies) setCookie(res, cookie);
        res.status(statusCode).json(response.body);
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

function setCookie(res: Response, { name, value, maxAgeSeconds, ...attributes }: HttpCookie) {
  res.cookie(name, value, { ...attributes, maxAge: maxAgeSeconds * MS_PER_SECOND });
}

function requireSingleValuedQuery(query: Request["query"]): HttpQuery {
  const result: HttpQuery = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== "string") throw new BadRequestError(`Repeated query parameter: ${key}`);
    result[key] = value;
  }
  return result;
}
