 document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('pdf', document.getElementById('pdfFile').files[0]);

  const response = await fetch('/api/convert', {
    method: 'POST',
    body: formData,
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video.mp4';
    document.getElementById('output').appendChild(a);
    a.click();
  } else {
    document.getElementById('output').textContent = 'Error converting PDF to video';
  }
});
