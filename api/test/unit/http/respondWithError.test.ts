import { Response } from "express";
import { NotFoundError, ValidationError } from "../../../src/domain/error/DomainError";
import BadRequestError from "../../../src/infra/http/BadRequestError";
import { respondWithError } from "../../../src/infra/http/respondWithError";

function fakeResponse() {
  const response = {
    statusCode: undefined as number | undefined,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
  };
  return response;
}

function respond(error: unknown) {
  const response = fakeResponse();
  respondWithError(response as unknown as Response, error);
  return { status: response.statusCode, body: response.body };
}

describe("respondWithError", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  test.each([
    [new BadRequestError("Id invalid"), 400],
    [new NotFoundError("Item not found"), 404],
    [new ValidationError("Invalid Unit"), 422],
  ])("Should answer a known error with its status and message: %p", (error, status) => {
    expect(respond(error)).toEqual({ status, body: { message: error.message } });
    expect(consoleError).not.toHaveBeenCalled();
  });

  test("Should answer a malformed JSON body with 400", () => {
    const parseFailure = Object.assign(new SyntaxError("Unexpected end"), {
      type: "entity.parse.failed",
      status: 400,
    });

    expect(respond(parseFailure)).toEqual({ status: 400, body: { message: "Invalid JSON body" } });
  });

  test("Should answer other client errors raised by the framework with their status", () => {
    const tooLarge = Object.assign(new Error("request entity too large"), { status: 413 });

    expect(respond(tooLarge)).toEqual({ status: 413, body: { message: "Invalid request" } });
  });

  test.each([new Error("database is down at /home/someone/secret.ts"), "boom", null])(
    "Should hide unexpected errors behind a generic 500 and log them: %p",
    (error) => {
      expect(respond(error)).toEqual({
        status: 500,
        body: { message: "Internal server error" },
      });
      expect(consoleError).toHaveBeenCalledWith(error);
    },
  );
});
