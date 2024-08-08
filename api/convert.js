const { PDFDocument } = require('pdf-lib');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('@ffmpeg/ffmpeg');
const { createFFmpeg, fetchFile } = ffmpeg;

const upload = multer({ dest: '/tmp/uploads/' });

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      upload.single('pdf')(req, res, async (err) => {
        if (err) {
          return res.status(500).send('File upload error');
        }

        const pdfPath = req.file.path;
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        const ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();

        const imagePromises = pages.map(async (page, index) => {
          const { width, height } = page.getSize();
          const imageData = await page.renderToJPEG({ width, height });
          const imagePath = `/tmp/uploads/page-${index}.jpg`;
          fs.writeFileSync(imagePath, imageData);
          return imagePath;
        });

        const imagePaths = await Promise.all(imagePromises);

        const inputFiles = imagePaths.map((imgPath, idx) => {
          const ffmpegPath = `/data/page-${idx}.jpg`;
          ffmpeg.FS('writeFile', ffmpegPath, await fetchFile(imgPath));
          return ffmpegPath;
        });

        const outputPath = '/tmp/uploads/output.mp4';
        await ffmpeg.run(
          '-framerate', '1',
          '-i', '/data/page-%d.jpg',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          'output.mp4'
        );

        const data = ffmpeg.FS('readFile', 'output.mp4');
        fs.writeFileSync(outputPath, data);

        res.download(outputPath, 'video.mp4', (err) => {
          if (err) console.error(err);
          fs.unlinkSync(pdfPath);
          imagePaths.forEach(fs.unlinkSync);
          fs.unlinkSync(outputPath);
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while processing the PDF.');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};