const { Router } = require("express");
const router = Router();

const controller = require("../controllers/order.controller");
const middlewares = require("../middlewares");
const { OrderCreateValidation } = require("../validations/order.validation");

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order api
 */

/**
 * @swagger
 * /api/order/create:
 *   post:
 *     summary: create order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direction:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 example: 20:00
 *               price:
 *                 type: string
 *                 example: 200$
 *               limit_of_clients:
 *                 type: number
 *                 example: 6
 *     responses:
 *       '201':
 *          description: Order created
 *       '400':
 *          description: Invalid
 *       '401':
 *          description: not admin
 *       '500':
 *         description: Server error
 */

router.post(
  "/order/create",
  middlewares.verifyToken,
  middlewares.verifyAdmin,
  middlewares.verifyValidation(OrderCreateValidation),
  controller.CreateOrder
);

/**
 * @swagger
 * /api/order/list:
 *   get:
 *     summary: order lists
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *          description: Order list
 *       '401':
 *          description: not admin
 *       '500':
 *         description: Server error
 */

router.get(
  "/order/list",
  middlewares.verifyToken,
  middlewares.verifyAdmin,
  controller.getOrders
);

/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: get order by id
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       '200':
 *          description: Order found
 *       '401':
 *          description: not admin
 *       '404':
 *          description: order not found
 *       '500':
 *         description: Server error
 */
router.get(
  "/order/:id",
  middlewares.verifyToken,
  middlewares.verifyAdmin,
  controller.getOrderById
);


/**
 * @swagger
 * /api/order/{id}:
 *   put:
 *     summary: update order by id
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direction:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 example: 20:00
 *               price:
 *                 type: string
 *                 example: 200$
 *               limit_of_clients:
 *                 type: number
 *                 example: 6
 *     responses:
 *       '200':
 *          description: Order updated
 *       '401':
 *          description: not admin
 *       '404':
 *          description: order not found
 *       '500':
 *         description: Server error
 */
router.put(
  "/order/:id",
  middlewares.verifyToken,
  middlewares.verifyAdmin,
  controller.UpdateOrder
);

module.exports = router;