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
  
  // Convert the canvas to a Data URL
  const dataUrl = canvas.toDataURL('image/jpeg');

  // Convert the Data URL to a Blob
  const blob = dataURLToBlob(dataUrl);

  analyzeImage(blob);
}

function dataURLToBlob(dataUrl) {
  const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length; // change 'const' to 'let'
  const u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

// Analyze the captured image
async function analyzeImage(blob) {
  // Create a new FormData object and append the Blob object to it
  const formData = new FormData();
  formData.append('image', blob);

  // Send a POST request to the Azure Computer Vision API
  const response = await fetch(`${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Tags&language=pt`, {
  method: 'POST',
  headers: {
    'Ocp-Apim-Subscription-Key': apiKey
  },
  body: formData
});

  // Parse the response and display the result
  const data = await response.json();
  result.innerHTML = `
    <p>O que estou vendo:${data.description.captions[0].text}</p>
  `;
  textoFalado(1.5);
}

async function textoFalado(rate){
  const text = document.querySelector('p').textContent;
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  synth.speak(utterance);
}
