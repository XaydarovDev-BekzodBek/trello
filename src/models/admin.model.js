const { Schema, model } = require("mongoose");
const { hash } = require("argon2");

const AdminSchema = new Schema(
  {
    login: { type: String, required: true },
    password: { type: String, required: true },
    is_super_admin: { type: Boolean, defaultValue: false, required: true },
  },
  { timestamps: true }
);

AdminSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await hash(this.password);
  }
});

const adminModel = model("admin", AdminSchema);

module.exports = adminModel;