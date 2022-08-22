const express = require('express');
const router = express.Router();

const controller = require('./commonController.js');

router.use(async (req, res, next) => {
    next();
});


router.route('/keywordsearch').get(controller.getKeywordsearch);



module.exports = router;
