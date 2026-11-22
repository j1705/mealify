import { NextFunction, Request, Response } from "express";
import { corsMiddleware } from "../../../src/infra/http/corsMiddleware";

function fakeResponse() {
  const headers: Record<string, string> = {};
  const response = {
    headers,
    sentStatus: undefined as number | undefined,
    setHeader(name: string, value: string) {
      headers[name] = value;
      return response;
    },
    sendStatus(status: number) {
      response.sentStatus = status;
      return response;
    },
  };
  return response;
}

function run(method: string) {
  const response = fakeResponse();
  const next = jest.fn();
  corsMiddleware("http://front.local")(
    { method } as Request,
    response as unknown as Response,
    next as NextFunction,
  );
  return { response, next };
}

describe("corsMiddleware", () => {
  test("Should allow the front origin only for the methods and headers the API uses", () => {
    const { response } = run("GET");

    expect(response.headers).toEqual({
      "Access-Control-Allow-Origin": "http://front.local",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
  });

  test("Should pass regular requests on to the routes", () => {
    const { response, next } = run("POST");

    expect(next).toHaveBeenCalledTimes(1);
    expect(response.sentStatus).toBeUndefined();
  });

  test("Should answer a preflight with 204 without reaching the routes", () => {
    const { response, next } = run("OPTIONS");

    expect(response.sentStatus).toBe(204);
    expect(next).not.toHaveBeenCalled();
  });
});
