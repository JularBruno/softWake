const helpers = require('./_helpers.js');
const express = require('express');
const router = express.Router();

router.post('/upload', (req, res, next) => helpers.upload(req, res, next))

router.delete('/delete', (req, res, next) => helpers.deleteFiles(req, res))


module.exports = router