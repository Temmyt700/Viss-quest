import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
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

    const parsed = result.data as {
      body: Request["body"];
      query: Request["query"];
      params: Request["params"];
    };

    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;
    next();
  };
