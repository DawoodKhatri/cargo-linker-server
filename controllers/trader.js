/** @type {import("express").RequestHandler} */

import Trader from "../models/trader.js";
import Verification from "../models/verification.js";
import { generateOTP, sendVerificationMail } from "../utils/verification.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Container from "../models/container.js";

export const traderGetVerificationMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return errorResponse({
        res,
        status: 400,
        message: "Please enter email address",
      });

    const trader = await Trader.findOne({ email });
    if (trader)
      return errorResponse({
        res,
        status: 409,
        message: "Email already taken",
      });

    const otp = generateOTP();
    await sendVerificationMail(email, otp);

    let verification = await Verification.findOne({ email });
    if (!verification) {
      verification = await Verification.create({ email, otp });
    } else {
      verification = await Verification.findOneAndUpdate(
        { email },
        { $set: { otp } }
      );
    }

    return successResponse({ res, message: "Verification mail sent" });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const traderSignup = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp)
      return errorResponse({
        res,
        status: 400,
        message: "Please fill all the fields",
      });

    const verification = await Verification.findOne({ email, otp });
    if (!verification)
      return errorResponse({
        res,
        status: 401,
        message: "Incorrect OTP",
      });

    let difference =
      (new Date().getTime() - verification.updatedAt.getTime()) / 1000 / 60;
    if (difference > 5)
      return errorResponse({
        res,
        status: 422,
        message: "OTP Expired",
      });

    await verification.deleteOne();
    const trader = await Trader.create({ email, password });

    let options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    const token = await trader.generateToken();

    return successResponse({
      res: res.cookie("token", token, options),
      message: "Signup Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const traderLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse({
        res,
        status: 400,
        message: "Please fill all the fields",
      });

    const trader = await Trader.findOne({ email }).select("password");
    if (!trader)
      return errorResponse({
        res,
        status: 404,
        message: "Account not found",
      });

    const isPasswordMatch = await trader.matchPassword(password);
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

    const token = await trader.generateToken();

    return successResponse({
      res: res.cookie("token", token, options),
      message: "Login Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getPickupLocations = async (req, res) => {
  try {
    const dropLocation = {
      lat: Number(req.query.dropLat),
      long: Number(req.query.dropLong),
    };
    
    if (!dropLocation.lat || !dropLocation.long)
      return errorResponse({ res, message: "Please provide drop location" });

    const tolerance = 0.01;

    const pickupLocations = await Container.find({
      "drop.lat": {
        $gte: dropLocation.lat - tolerance,
        $lte: dropLocation.lat + tolerance,
      },
      "drop.long": {
        $gte: dropLocation.long - tolerance,
        $lte: dropLocation.long + tolerance,
      },
    }).select("pickup");

    return successResponse({ res, data: pickupLocations });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getContainerDetails = async (req, res) => {
  try {
    const { containerId } = req.params;
    if (!containerId)
      return errorResponse({ res, message: "Please provide container ID" });

    const container = await Container.findById(containerId);
    if (!container)
      return errorResponse({ res, message: "Container not found" });

    return successResponse({ res, data: container });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
