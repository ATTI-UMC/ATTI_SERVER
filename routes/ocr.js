const express = require('express');
const path = require('path');
const Tesseract = require('tesseract.js');
const multerConfig = require('../config/multerConfig');

const router = express.Router();
const upload = multerConfig;

// GET 요청 처리 라우트 추가
router.get('/', (req, res) => {
  res.send('OCR endpoint is ready. Use POST /upload to upload an image.');
});

router.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = path.join(__dirname, '..', req.file.path);

  Tesseract.recognize(
    imagePath,
    'eng',
    {
      logger: m => console.log(m)
    }
  ).then(({ data: { text } }) => {
    res.send({ text });
  }).catch(err => {
    res.status(500).send({ error: err.message });
  });
});

module.exports = router;
