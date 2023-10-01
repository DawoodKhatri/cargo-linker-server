import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const sendVerificationMail = async (email, otp) => {
  const from = "CargoLinker";
  const user = process.env.EMAIL_USERNAME;
  const pass = process.env.EMAIL_PASSWORD;

  const date = new Date();
  date.setHours(date.getHours() + 1);

  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "../templates/mailTemplate.html"),
    { encoding: "utf-8" }
  );

  const template = handlebars.compile(htmlTemplate);
  const html = template({ name: email.split("@")[0], otp: otp, validity: 5 });

  const options = {
    from: `${from} <${user}>`,
    to: email,
    subject: "Email Verification",
    html: html,
  };

  let transpoter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user, pass },
  });

  await transpoter.sendMail(options);
};
