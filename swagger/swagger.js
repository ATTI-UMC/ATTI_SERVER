const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /user/{userid}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a single user by their ID
 *     parameters:
 *       - in: path
 *         name: userid
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userid:
 *                   type: integer
 *                 nickname:
 *                   type: string
 *                 name:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 school:
 *                   type: string
 *                 MBTI_FK:
 *                   type: integer
 *                 department:
 *                   type: string
 *                 interest_tags:
 *                   type: string
 *                 username:
 *                   type: string
 *                 password:
 *                   type: string
 *                 status:
 *                   type: string
 *                 student_id:
 *                   type: string
 *               required:
 *                 - userid
 *                 - nickname
 *                 - name
 *                 - age
 *                 - username
 *                 - password
 *                 - status
 *                 - student_id
 *       404:
 *         description: User not found
 */

  
  module.exports = router;
