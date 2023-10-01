import Company from "../models/company";
import Verification from "../models/verification";
import { generateOTP, sendVerificationMail } from "../utils/verification";

export const getVerificationMail = async (req, res) => {
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
    await sendVerificationMail(email, otp)

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
