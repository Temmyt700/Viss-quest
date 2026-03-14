import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";

export const validate =
  (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed.",
        issues: result.error.flatten(),
      });
      return;
    }

    req.body = result.data.body;
    req.query = result.data.query as Request["query"];
    req.params = result.data.params as Request["params"];
    next();
  };
