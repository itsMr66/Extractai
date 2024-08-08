const express = require('express');
const multer = require('multer');
const pdf2video = require('pdf-to-video');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route for handling PDF file upload and conversion
app.post('/convert', upload.single('pdf'), async (req, res) => {
  try {
    const pdfPath = req.file.path;
    const videoPath = `public/videos/${req.file.filename.split('.')[0]}.mp4`;

    await pdf2video.convert(pdfPath, videoPath);

    res.status(200).json({ videoUrl: `/videos/${req.file.filename.split('.')[0]}.mp4` });
  } catch (error) {
    console.error('Error converting PDF to video:', error);
    res.status(500).json({ error: 'Error converting PDF to video' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});