const { verify, hash } = require("argon2");
const { adminModel } = require("../models");
const { JWT_SECRET } = require("../constants/.envirment");
const jwt = require("jsonwebtoken");

exports.initSuperAdmin = async () => {
  try {
    const super_admin = await adminModel.findOne({ is_super_admin: true });

    if (!super_admin) {
      await adminModel.create({
        login: "admin@gmail.com",
        password: "admin",
        is_super_admin: true,
      });
      console.log("super admin created");
    } else {
      console.log("there is a super admin");
    }
  } catch (error) {
    console.error(error);
  }
};

exports.AdminLogin = async (req, res) => {
  try {
    const { login, password } = req.body;

    const admin = await adminModel.findOne({ login });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Login or password invalid" });
    }

    const comparedPassword = await verify(admin.password, password);
    if (!comparedPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Login or password invalid" });
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "31d" });

    return res
      .status(200)
      .json({ success: true, token, message: "login is successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.getMe = async (req, res) => {
  try {
    const adminId = req.use.id;
    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const { login, password } = req.body;

    const oldAdmin = await adminModel.findOne({ login });

    if (oldAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "there is a login" });
    }

    const admin = await adminModel.create({
      login,
      password,
      is_super_admin: false,
    });

    return res.status(201).json({ success: true, admin });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const adminId = req.use.id;
    const { login, password } = req.body;

    const admin = await adminModel.findByIdAndUpdate(
      adminId,
      { login, password:await hash(password) },
      { new: true }
    );

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "admin updated", admin });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};
