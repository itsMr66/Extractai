const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/api/convert', upload.single('pdf'), (req, res) => {
    const pdfPath = req.file.path;
    const outputPath = path.join('uploads', `${req.file.filename}.mp4`);

    // Run FFMpeg command to convert PDF to video
    const ffmpegCommand = `ffmpeg -f lavfi -i color=c=white:s=1280x720:d=5 -vf "drawtext=fontfile=/path/to/font.ttf:fontsize=40:textfile=${pdfPath}:x=(w-text_w)/2:y=(h-text_h)/2" -t 5 ${outputPath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send('Error converting PDF to video');
        }

        res.download(outputPath, 'video.mp4', (err) => {
            if (err) console.error(err);
            fs.unlinkSync(pdfPath);
            fs.unlinkSync(outputPath);
        });
    });
});

module.exports = app;