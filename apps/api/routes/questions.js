const express = require('express');
const router = express.Router();
const controller = require('../controllers/questionController');

router.post('/', controller.createQuestion);
router.get('/', controller.getQuestions);
router.patch('/:id', controller.updateQuestion);
router.delete('/', controller.clearQuestions);
router.patch("/:id/answer", controller.addAnswer);
// router.delete("/:id", controller.deleteQuestion);


module.exports = router;
