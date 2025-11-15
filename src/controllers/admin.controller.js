const { adminModel } = require("../models");

exports.initSuperAdmin = async () => {
  try {
    const super_admin = await adminModel.findOne({ is_super_admin: true });

    if (!super_admin) {
      await adminModel.create({
        login: "admin@admin.com",
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
