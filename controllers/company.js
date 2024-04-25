/** @type {import("express").RequestHandler} */

import Company from "../models/company.js";
import Verification from "../models/verification.js";
import { generateOTP, sendVerificationMail } from "../utils/verification.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  CONTAINER_SIZES,
  CONTAINER_TYPES,
  VERIFICATION_STATUS,
} from "../constants/company.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { deleteFile, uploadFile } from "../utils/storage.js";
import Container from "../models/container.js";
import {
  getEncodedPolylines,
  getPlacesFromAddress,
} from "../utils/googleMaps.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const companyGetVerificationMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return errorResponse({
        res,
        status: 400,
        message: "Please enter email address",
      });

    const company = await Company.findOne({ email });
    if (company)
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

export const companySignup = async (req, res) => {
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
    const company = await Company.create({ email, password });

    let options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    const token = await company.generateToken();

    return successResponse({
      res: res.cookie("token", token, options),
      message: "Signup Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse({
        res,
        status: 400,
        message: "Please fill all the fields",
      });

    const company = await Company.findOne({ email }).select("password");
    if (!company)
      return errorResponse({
        res,
        status: 404,
        message: "Account not found",
      });

    const isPasswordMatch = await company.matchPassword(password);
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

    const token = await company.generateToken();

    return successResponse({
      res: res.cookie("token", token, options),
      message: "Login Successfull",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getCompanyVerificationStatus = async (req, res) => {
  try {
    return successResponse({
      res,
      message: "Verification Status",
      data: {
        status: req.company.verification.status,
        remark:
          req.company.verification.status === VERIFICATION_STATUS.rejected
            ? req.company.verification.remark
            : undefined,
        details:
          req.company.verification.status === VERIFICATION_STATUS.verified
            ? {
                name: req.company.name,
                serviceType: req.company.serviceType,
                establishmentDate: req.company.establishmentDate,
                registrationNumber: req.company.registrationNumber,
              }
            : undefined,
      },
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const submitCompanyVerificationDetails = async (req, res) => {
  try {
    if (
      req.company.verification.status === VERIFICATION_STATUS.underVerification
    )
      return errorResponse({
        res,
        status: 409,
        message: "Already submitted for verification",
      });

    const { name, serviceType, establishmentDate, registrationNumber } =
      req.body;

    const [license, bankStatement] = [
      req.files.find(({ fieldname }) => fieldname === "license"),
      req.files.find(({ fieldname }) => fieldname === "bankStatement"),
    ];

    if (
      ![
        name,
        serviceType,
        establishmentDate,
        registrationNumber,
        license,
        bankStatement,
      ].every(Boolean)
    )
      return errorResponse({
        res,
        status: 400,
        message: "Please fill all the fields",
      });

    // if (
    //   !license.mimetype.includes("image") ||
    //   !bankStatement.mimetype.includes("image")
    // )
    //   return errorResponse({
    //     res,
    //     status: 400,
    //     message: "Unsupported file type, only images are supported",
    //   });

    const company = await Company.findById(req.company._id);

    if (company.license) deleteFile(company.license);
    if (company.bankStatement) deleteFile(company.bankStatement);

    const licensePath = await uploadFile("documents", license);
    const bankStatementPath = await uploadFile("documents", bankStatement);

    company.set({
      name,
      serviceType,
      establishmentDate,
      registrationNumber,
      license: licensePath,
      bankStatement: bankStatementPath,
      verification: { status: VERIFICATION_STATUS.underVerification },
    });

    await company.save();

    return successResponse({
      res,
      message: "Details submitted for verification",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const getCompanyListedContainers = async (req, res) => {
  try {
    const company = await Company.findById(req.company._id).populate(
      "containers"
    );

    const containers = await Promise.all(
      company.containers.map(async (container) => {
        const encodedPolylinePoints = await getEncodedPolylines(
          container.pickup,
          container.drop
        );
        return {
          ...container.toObject(),
          encodedPolylinePoints: encodedPolylinePoints ?? "",
        };
      })
    );

    return successResponse({
      res,
      message: "Listed Containers",
      data: { containers },
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};

export const companyListContainer = async (req, res) => {
  try {
    const {
      containerId,
      type,
      size,
      due,
      dimension,
      price,
      pickupAddress,
      dropAddress,
    } = req.body;

    if (
      !containerId ||
      !type ||
      !size ||
      !due ||
      !dimension.length ||
      !dimension.width ||
      !dimension.height ||
      !price ||
      !pickupAddress ||
      !dropAddress
    )
      return errorResponse({
        res,
        status: 400,
        message: "Please fill all the fields",
      });

    let container = await Container.findOne({
      containerId: containerId.toUpperCase(),
    });

    if (container)
      return errorResponse({
        res,
        status: 409,
        message: "Container ID already exists",
      });

    if (!CONTAINER_TYPES.includes(type))
      return errorResponse({
        res,
        status: 400,
        message: "Invalid Container Type",
      });

    if (!CONTAINER_SIZES.includes(size))
      return errorResponse({
        res,
        status: 400,
        message: "Invalid Container Size",
      });

    const pickupPlaces = await getPlacesFromAddress(pickupAddress);

    if (pickupPlaces.length === 0)
      return errorResponse({
        res,
        status: 404,
        message: "Pickup location not found",
      });

    const pickupLocation = {
      address: pickupAddress,
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
      address: dropAddress,
      lat: dropPlaces[0].geometry.location.lat,
      long: dropPlaces[0].geometry.location.lng,
    };

    container = await Container.create({
      containerId: containerId.toUpperCase(),
      type,
      size,
      due,
      dimension,
      price,
      pickup: pickupLocation,
      drop: dropLocation,
    });

    await Company.findByIdAndUpdate(req.company._id, {
      $push: { containers: container._id },
    });

    return successResponse({
      res,
      message: "Container Listed Successfully",
    });
  } catch (error) {
    return errorResponse({ res, message: error.message });
  }
};
