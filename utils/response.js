import { response } from "express";

export const successResponse = (status, message, data) => {
  response.status(status).json({ success: true, message, data });
};

export const errorResponse = (
  status = 500,
  message = "Internal Server Error"
) => {
  response.status(status).json({ success: true, message });
};
