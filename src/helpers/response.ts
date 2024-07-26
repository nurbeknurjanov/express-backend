import { Response } from 'express';

export const handleResponseError = (res: Response, error: Error) =>
  res.status(400).send({
    message: error.message,
  });
export const handleResponseFieldsError = (
  res: Response,
  fieldsErrors: Record<string, string>
) =>
  res.status(422).send({
    code: 422,
    message: 'Bad parameters',
    fieldsErrors,
  });
