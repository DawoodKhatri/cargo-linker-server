/** @type {import("express").RequestHandler} */

import { errorResponse, successResponse } from "../utils/response.js";

export const logout = async (req, res) => {
  try {
    let options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    return successResponse({
      res: res.clearCookie("token", options),
      message: "Logout Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { role } = req;

    return successResponse({ res, message: `Auth Details`, data: { role } });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
