
document.addEventListener('DOMContentLoaded', () => {
  const captureButton = document.getElementById('capture-button');
  const cameraStream = document.getElementById('camera-stream');
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const result = document.getElementById('result');


  const endpoint = 'https://testeaudiodescricao.cognitiveservices.azure.com/';
  const apiKey = '05d2086b9f244bbd80c575c5a39e10ad';

  // Acessar a câmera do usuário
  navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      cameraStream.srcObject = stream;
      captureButton.addEventListener('click', captureImage);
    })
    .catch(error => console.error('Erro ao acessar câmera:', error));

  // Capturar uma imagem da câmera
  function captureImage() {
    canvas.width = cameraStream.videoWidth;
    canvas.height = cameraStream.videoHeight;
    context.drawImage(cameraStream, 0, 0, canvas.width, canvas.height);

    // Converter o canvas em uma URL de dados
    const dataUrl = canvas.toDataURL('image/jpeg');

    // Converter a URL de dados em um Blob
    const blob = dataURLToBlob(dataUrl);

    analyzeImage(blob);
  }

  function dataURLToBlob(dataUrl) {
    const arr = dataUrl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  // Analisar a imagem capturada
  async function analyzeImage(blob) {
    // Criar um novo objeto FormData e anexar o objeto Blob a ele
    const formData = new FormData();
    formData.append('image', blob);

    // Enviar uma solicitação POST para a API de Visão Computacional do Azure
    const response = await fetch(`${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Tags&language=pt`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      },
      body: formData
    });

    // resposta e exibir o resultado
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
});