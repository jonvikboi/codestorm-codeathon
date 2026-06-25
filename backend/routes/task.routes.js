const express = require('express');
const { createTask, getTasks, getTaskById, updateTask, deleteTask, completeTask } = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, validateUUIDParam } = require('../middleware/validation.middleware');
const { createTaskSchema, updateTaskSchema } = require('../schemas/task.schema');

const router = express.Router();

router.use(authenticate); // Protect all task routes

router.post('/', validate(createTaskSchema), createTask);
router.get('/', getTasks);
router.get('/:id', validateUUIDParam, getTaskById);
router.put('/:id', validateUUIDParam, validate(updateTaskSchema), updateTask);
router.patch('/:id/complete', validateUUIDParam, completeTask);
router.delete('/:id', validateUUIDParam, deleteTask);

module.exports = router;
