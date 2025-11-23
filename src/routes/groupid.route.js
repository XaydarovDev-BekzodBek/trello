const { Router } = require("express");
const router = Router();

const middlewares = require("../middlewares");
const { createGroupId, getGroupIds } = require("../controllers/groupIds.controller");
const { GroupIdCreateSchema } = require("../validations/groupId.validation");

/**
 * @swagger
 * tags:
 *   name: groupId
 *   description: group id point
 */


/**
 * @swagger
 * /api/groupId/list:
 *   get:
 *     summmary: get group id list
 *     tags: [groupId]
 *     responses:
 *       '200':
 *          description: Group list
 *       '401':
 *          description: not admin
 *       '500':
 *         description: Server error
 */
router.get("/groupId/list",getGroupIds)

module.exports = router;
