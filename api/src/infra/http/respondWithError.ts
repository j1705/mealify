import { Response } from "express";
import { httpStatusFor, INTERNAL_SERVER_ERROR } from "./httpStatusFor";

type FrameworkError = { type?: string; status?: number };

export function respondWithError(res: Response, error: unknown) {
  const status = httpStatusFor(error);
  if (status !== INTERNAL_SERVER_ERROR) {
    res.status(status).json({ message: (error as Error).message });
    return;
  }

  const { type, status: frameworkStatus } = (error ?? {}) as FrameworkError;
  if (type === "entity.parse.failed") {
    res.status(400).json({ message: "Invalid JSON body" });
    return;
  }
  if (isClientErrorStatus(frameworkStatus)) {
    res.status(frameworkStatus).json({ message: "Invalid request" });
    return;
  }

  console.error(error);
  res.status(INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
}

function isClientErrorStatus(status: unknown): status is number {
  return typeof status === "number" && status >= 400 && status < 500;
}
