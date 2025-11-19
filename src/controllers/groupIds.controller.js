const { GroupIdModel } = require("../models");

exports.createGroupId = async (req, res) => {
  try {
    const { groupId } = req.body;

    await GroupIdModel.create({ groupId });

    return res
      .status(201)
      .json({ success: true, message: "group id yaratildi" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.getGroupIds = async (req, res) => {
  try {
    const groupIds = await GroupIdModel.find({});

    return res
      .status(200)
      .json({ success: true, message: "list of group ids", groupIds });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};
