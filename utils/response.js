/** @type {import("express").RequestHandler} */

export const successResponse = ({ res, message, data }) => {
  return res.status(200).json({ success: true, message, data })
};

export const errorResponse = ({
  res,
  status = 500,
  message = "Internal Server Error",
}) => {
  return res.status(status).json({ success: false, message });
};
