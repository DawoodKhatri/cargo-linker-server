/** @type {import("express").RequestHandler} */

import Trader from "../models/trader.js";
import Verification from "../models/verification.js";
import { generateOTP, sendVerificationMail } from "../utils/verification.js";
import { errorResponse, successResponse } from "../utils/response.js";
import Container from "../models/container.js";
import {
  getPlacesFromAddress,
  getEncodedPolylines,
} from "../utils/googleMaps.js";
import Company from "../models/company.js";
import Razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Booking from "../models/booking.js";

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

export const searchContainers = async (req, res) => {
  try {
    const { pickupAddress, dropAddress } = req.query;
    if (!pickupAddress || !dropAddress)
      return errorResponse({
        res,
        status: 400,
        message: "Please provide pickup & drop address",
      });

    const pickupPlaces = await getPlacesFromAddress(pickupAddress);

    if (pickupPlaces.length === 0)
      return errorResponse({
        res,
        status: 404,
        message: "Pickup location not found",
      });

    const pickupLocation = {
      lat: pickupPlaces[0].geometry.location.lat,
      long: pickupPlaces[0].geometry.location.lng,
    };

    const dropPlaces = await getPlacesFromAddress(dropAddress);

    if (dropPlaces.length === 0)
      return errorResponse({
        res,
        status: 404,
        message: "Drop location not found",
      });

    const dropLocation = {
      lat: dropPlaces[0].geometry.location.lat,
      long: dropPlaces[0].geometry.location.lng,
    };

    const tolerance = 0.01;

    let containers = await Container.find({
      "pickup.lat": {
        $gte: pickupLocation.lat - tolerance,
        $lte: pickupLocation.lat + tolerance,
      },
      "pickup.long": {
        $gte: pickupLocation.long - tolerance,
        $lte: pickupLocation.long + tolerance,
      },
      "drop.lat": {
        $gte: dropLocation.lat - tolerance,
        $lte: dropLocation.lat + tolerance,
      },
      "drop.long": {
        $gte: dropLocation.long - tolerance,
        $lte: dropLocation.long + tolerance,
      },
      booking: { $exists: false },
    });

    for (const container of containers) {
      const company = await Company.findOne({ containers: container._id });

      const encodedPolylinePoints = await getEncodedPolylines(
        container.pickup,
        container.drop
      );

      containers[containers.indexOf(container)] = {
        ...container.toObject(),
        encodedPolylinePoints: encodedPolylinePoints,
        companyName: company.name,
        serviceType: company.serviceType,
      };
    }

    return successResponse({ res, data: { containers } });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getContainerDetails = async (req, res) => {
  try {
    const { containerId } = req.params;
    if (!containerId)
      return errorResponse({
        res,
        status: 400,
        message: "Please provide container ID",
      });

    const container = await Container.findById(containerId);
    if (!container)
      return errorResponse({
        res,
        status: 404,
        message: "Container not found",
      });

    const company = await Company.findOne({ containers: containerId });

    return successResponse({
      res,
      data: {
        ...container.toObject(),
        companyName: company.name,
        serviceType: company.serviceType,
      },
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const startBooking = async (req, res) => {
  try {
    const { containerId } = req.params;
    if (!containerId)
      return errorResponse({
        res,
        status: 400,
        message: "Container ID is required",
      });

    const container = await Container.findById(containerId);
    if (!container)
      return errorResponse({
        res,
        status: 404,
        message: "Container not found",
      });

    if (container.booking)
      return errorResponse({
        res,
        status: 400,
        message: "Container already booked",
      });

    const order = await Razorpay().orders.create({
      amount: container.price * 100,
      currency: "INR",
      notes: {
        trader_id: req.trader._id,
        container_id: containerId,
      },
    });

    return successResponse({
      res,
      message: "Booking created successfully",
      data: { order },
    });
  } catch (error) {
    console.log(error);
    return errorResponse({ res, message: error.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const {
      payload: {
        payment: {
          entity: {
            order_id,
            amount,
            notes: { container_id, trader_id } = {},
          } = {},
        } = {},
      } = {},
    } = req.body;

    if (!order_id || !amount || !container_id || !trader_id)
      return errorResponse({
        res,
        status: 400,
        message: "Please provide all the details",
      });

    const container = await Container.findById(container_id);
    if (!container)
      return errorResponse({
        res,
        status: 404,
        message: "Container not found",
      });

    if (container.booking)
      return errorResponse({
        res,
        status: 400,
        message: "Container already booked",
      });

    const company = await Company.findOne({ containers: container_id });

    const booking = await Booking.create({
      container: container_id,
      trader: trader_id,
      company: company._id,
      orderId: order_id,
      amount: amount / 100,
    });

    container.booking = booking._id;
    await container.save();

    company.bookings.push(booking._id);
    await company.save();

    await Trader.findByIdAndUpdate(trader_id, {
      $push: { bookings: booking._id },
    });

    return successResponse({
      res,
      message: "Booking completed successfully",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
