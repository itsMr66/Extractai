document.getElementById('uploadForm').addEventListener('submit', async (e) => {
   e.preventDefault(); // Prevents the default form submission behavior
 
   const formData = new FormData();
   formData.append('pdf', document.getElementById('pdfFile').files[0]);
 
   document.getElementById('loading').style.display = 'block';
   document.getElementById('output').innerHTML = '';
 
   try {
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
       a.textContent = 'Download your video';
       document.getElementById('output').appendChild(a);
     } else {
       document.getElementById('output').textContent = 'Error converting PDF to video';
     }
   } catch (error) {
     document.getElementById('output').textContent = 'An error occurred during conversion.';
   } finally {
     document.getElementById('loading').style.display = 'none';
   }
 });