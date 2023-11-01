import Mailjet from "node-mailjet";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const sendVerificationMail = async (email, otp) => {
  try {
    const name = email.split("@")[0];
    
    const mailjet = Mailjet.apiConnect(
      process.env.MJ_API_KEY,
      process.env.MJ_API_SECRET
    );

    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: process.env.MJ_SENDER_EMAIL, Name: "CargoLinker" },
          To: [{ Email: email, Name: name }],
          TemplateID: 5233671,
          TemplateLanguage: true,
          Subject: "Verify your email address to create your account",
          Variables: {
            name: name,
            otp: otp,
          },
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
};
