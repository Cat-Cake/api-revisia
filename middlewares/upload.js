const multer = require('multer');
const createError = require('http-errors');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mo
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(createError(400, 'Seuls les fichiers PDF sont acceptés'));
    }
    cb(null, true);
  },
});

module.exports = upload;
