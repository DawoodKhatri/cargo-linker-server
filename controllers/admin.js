/** @type {import("express").RequestHandler} */

import Admin from "../models/admin.js";
import { errorResponse, successResponse } from "../utils/response.js";

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return errorResponse({
        res,
        status: 400,
        message: "Please fill all the fields",
      });

    const admin = await Admin.findOne({ username }).select("password");
    if (!admin)
      return errorResponse({ res, status: 404, message: "Account not found" });

    const isPasswordMatch = await admin.matchPassword(password);
    if (!isPasswordMatch)
      return errorResponse({
        res,
        status: 401,
        message: "Invalid credentials",
      });

    let options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    const token = await admin.generateToken();

    return successResponse({
      res: res.cookie("token", token, options),
      message: "Login Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
