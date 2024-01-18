import path from "path";
import Company from "../models/company.js";
import Verification from "../models/verification.js";
import { generateOTP, sendVerificationMail } from "../utils/verification.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { VERIFICATION_STATUS } from "../constants/verificationStatus.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const companyGetVerificationMail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({
        success: false,
        message: "Please enter email address",
      });

    const company = await Company.findOne({ email });
    if (company)
      return res.status(409).json({
        success: false,
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

    return res.status(200).json({
      success: true,
      message: "Verification mail sent",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const companySignup = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp)
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });

    const verification = await Verification.findOne({ email, otp });
    if (!verification)
      return res.status(401).json({
        success: false,
        message: "Incorrect OTP",
      });

    let difference =
      (new Date().getTime() - verification.updatedAt.getTime()) / 1000 / 60;
    if (difference > 5)
      return res.status(422).json({
        success: false,
        message: "OTP Expired",
      });

    await verification.deleteOne();
    const company = await Company.create({ email, password });

    let options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    if (process.env.NODE_ENV === "development") {
      options = {};
    }

    const token = await company.generateToken();

    res.status(200).cookie("token", token, options).json({
      success: true,
      message: "Signup Successfull",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });

    const company = await Company.findOne({ email }).select("password");
    if (!company)
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });

    const isPasswordMatch = await company.matchPassword(password);
    if (!isPasswordMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });

    let options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    if (process.env.NODE_ENV === "development") {
      options = {};
    }

    const token = await company.generateToken();

    res.status(200).cookie("token", token, options).json({
      success: true,
      message: "Login Successfull",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitCompanyVerificationDetails = async (req, res) => {
  try {
    if (
      req.company.verification.status === VERIFICATION_STATUS.underVerification
    )
      return res.status(409).json( {
        success: false,
        message: "Already submitted for verification",
      });
      
    const {
      name,
      serviceType,
      establishmentDate,
      registrationNumber,
      employeesCount,
      valuation,
    } = req.body;

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
        employeesCount,
        valuation,
        license,
        bankStatement,
      ].every(Boolean)
    )
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });

    fs.writeFileSync(
      path.join(
        __dirname,
        "../uploaded files",
        "license",
        license.originalname
      ),
      license.buffer
    );

    fs.writeFileSync(
      path.join(
        __dirname,
        "../uploaded files",
        "bankStatement",
        bankStatement.originalname
      ),
      bankStatement.buffer
    );

    const company = await Company.findByIdAndUpdate(
      req.company._id,
      {
        $set: {
          name,
          serviceType,
          establishmentDate,
          registrationNumber,
          employeesCount,
          valuation,
          license: path.join(
            __dirname,
            "../uploaded files",
            license.originalname
          ),
          bankStatement: path.join(
            __dirname,
            "../uploaded files",
            bankStatement.originalname
          ),
          verification: { status: VERIFICATION_STATUS.underVerification },
        },
      },
      { new: true }
    );

    return res
      .status(500)
      .json({ success: true, message: "Details submitted for verification" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
