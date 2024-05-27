import {Response} from "express";

export const handleResponseError = (res: Response, error: Error) => res.status(400).send(error.message);