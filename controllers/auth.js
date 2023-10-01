export const logout = async (req, res) => {
  try {
    return res.status(200).clearCookie("token").json({
      success: true,
      message: "Logout Successfull",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
