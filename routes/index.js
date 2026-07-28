const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ name: 'api-revisia', status: 'ok' });
});

module.exports = router;
