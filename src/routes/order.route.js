const { Router } = require("express");
const router = Router();

const controller = require("../controllers/order.controller");
const middlewares = require("../middlewares");
const {
  OrderCreateValidation,
  AddPeopleOrderValidation,
} = require("../validations/order.validation");

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
 *               arrive_time:
 *                 type: string
 *                 example: 20:00
 *               company:
 *                 type: string
 *               bilet_id:
 *                 type: string
 *               price:
 *                 type: string
 *                 example: 200$
 *               buyed_ticket:
 *                 type: number
 *                 example: 6
 *               type:
 *                 type: string
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
  // middlewares.verifyToken,
  // middlewares.verifyAdmin,
  middlewares.verifyValidation(OrderCreateValidation),
  controller.CreateOrder
);

/**
 * @swagger
 * /api/order/list:
 *   get:
 *     summary: order lists
 *     tags: [Order]
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
  // middlewares.verifyToken,
  // middlewares.verifyAdmin,
  controller.getOrders
);

/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: get order by id
 *     tags: [Order]

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
  // middlewares.verifyToken,
  // middlewares.verifyAdmin,
  controller.getOrderById
);

/**
 * @swagger
 * /api/order/{id}:
 *   put:
 *     summary: update order by id
 *     tags: [Order]
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
 *               buyed_ticket:
 *                 type: number
 *                 example: 6
 *               type:
 *                 type: string
 *               arrive_time:
 *                 type: string
 *                 example: 20:00
 *               company:
 *                 type: string
 *               bilet_id:
 *                 type: string
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
  // middlewares.verifyToken,
  // middlewares.verifyAdmin,
  controller.UpdateOrder
);

router.patch(
  "/order/:id",
  // middlewares.verifyToken,
  // middlewares.verifyAdmin,
  controller.changeOfOrder
);

router.delete("/order/:id", controller.deleteOrder);
router.delete("/order/:id/:userId", controller.deleteClient);

router.patch(
  "/order/:id/:userId",
  middlewares.verifyValidation(AddPeopleOrderValidation),
  controller.addPeopel
);

module.exports = router;
