/** @type {import("express").RequestHandler} */

import { errorResponse, successResponse } from "../utils/response.js";

export const logout = async (req, res) => {
  try {
    return successResponse({
      res: res.clearCookie("token"),
      message: "Logout Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { data, role } = req;

    return successResponse({ res, message: `${role} Details`, data });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
