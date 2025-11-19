const { Schema, model } = require("mongoose");

const GroupIdSchema = new Schema(
  {
    groupId: { type: String, required: true },
  },
  { timestamps: true }
);

const GroupIdModel = model("Group", GroupIdSchema);

module.exports = GroupIdModel;
