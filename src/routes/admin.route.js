const { Router } = require("express");
const router = Router();

const controller = require("../controllers/admin.controller");
const middlewares = require("../middlewares");
const {
  AdminLoginSchema,
  AdminRegisterSchema,
  AdminUpdateSchema,
} = require("../validations/admin.validation");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: admin api
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 example: string@gmail.com
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login is successfully
 *       '400':
 *         description: Invalid
 *       '500':
 *         description: Server error
 */

router.post(
  "/admin/login",
  middlewares.verifyValidation(AdminLoginSchema),
  controller.AdminLogin
);

/**
 * @swagger
 * /api/admin/me:
 *   get:
 *     summary: get admin by token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: admin found
 *       404:
 *         description: admin not found
 *       500:
 *         descriptin: Server error
 */
router.get(
  "/admin/me",
  middlewares.verifyToken,
  middlewares.verifyAdmin,
  controller.getMe
);

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: admin register
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 example: string@gmail.com
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Admin registered is successfully
 *       '400':
 *         description: Invalid
 *       '500':
 *         description: Server error
 */

router.post(
  "/admin/register",
  middlewares.verifyToken,
  middlewares.verifySuperAdmin,
  middlewares.verifyValidation(AdminRegisterSchema),
  controller.registerAdmin
);

/**
 * @swagger
 * /api/admin/update:
 *   put:
 *     summary: Admin update
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *                 example: salom@gmail.com
 *               password:
 *                 type: salom
 *     responses:
 *       200:
 *         description: admin updated
 *       401:
 *         description: you are not admin
 *       400:
 *         description: invalid
 *       404:
 *         description: admin not found
 *       500:
 *         descriptin: Server error
 */
router.put(
  "/admin/update",
  middlewares.verifyToken,
  middlewares.verifyAdmin,
  middlewares.verifyValidation(AdminUpdateSchema),
  controller.updateAdmin
);

module.exports = router;
