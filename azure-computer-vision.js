const captureButton = document.getElementById('capture-button');
const cameraStream = document.getElementById('camera-stream');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const result = document.getElementById('result');

// Replace with your Azure Computer Vision endpoint and API key
const endpoint = 'https://testeaudiodescricao.cognitiveservices.azure.com/';
const apiKey = '05d2086b9f244bbd80c575c5a39e10ad';

// Access the user's camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => {
    cameraStream.srcObject = stream;
    captureButton.addEventListener('click', captureImage);
  })
  .catch(error => console.error('Error accessing camera:', error));

// Capture an image from the camera
function captureImage() {
  canvas.width = cameraStream.videoWidth;
  canvas.height = cameraStream.videoHeight;
  context.drawImage(cameraStream, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  analyzeImage(imageData);
}

// Analyze the captured image
async function analyzeImage(imageData) {
  // Create a new Blob object from the image data
  const blob = new Blob([imageData.data], { type: 'image/jpeg' });

  // Create a new FormData object and append the Blob object to it
  const formData = new FormData();
  formData.append('image', blob);

  // Send a POST request to the Azure Computer Vision API
  const response = await fetch(`${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Tags`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey
    },
    body: formData
  });

  // Parse the response and display the result
  const data = await response.json();
  result.innerHTML = `
    <p>Description: ${data.description.captions[0].text}</p>
    <p>Categories: ${data.categories.map(c => c.name).join(', ')}</p>
    <p>Tags: ${data.tags.map(t => t.name).join(', ')}</p>
  `;
}