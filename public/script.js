const form = document.getElementById('pdf-upload-form');
 const videoContainer = document.getElementById('video-container');
 const convertedVideo = document.getElementById('converted-video');
 const downloadLink = document.getElementById('download-link');
 
 form.addEventListener('submit', async (event) => {
   event.preventDefault();
 
   const formData = new FormData(form);
 
   try {
     const response = await fetch('/convert', {
       method: 'POST',
       body: formData,
     });
 
     if (response.ok) {
       const { videoUrl } = await response.json();
       convertedVideo.src = videoUrl;
       downloadLink.href = videoUrl;
       downloadLink.classList.remove('hidden');
       videoContainer.classList.remove('hidden');
     } else {
       alert('Error converting PDF to video');
     }
   } catch (error) {
     console.error('Error:', error);
     alert('An error occurred. Please try again later.');
   }
 });