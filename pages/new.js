import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

export default function Home() {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Cambia entre 'user' y 'environment'

  const videoConstraints = {
    facingMode,
    width: 640,
    height: 480,
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    // Crop and resize the image
    cropAndResizeImage(imageSrc);
  }, [webcamRef]);

  const cropAndResizeImage = (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const cropCanvas = document.createElement('canvas');
      const cropContext = cropCanvas.getContext('2d');

      const cropWidth = 640; // Ancho del recorte
      const cropHeight = 320; // Alto del recorte
      const canvasWidth = img.width;
      const canvasHeight = img.height;
      const cropX = (canvasWidth - cropWidth) / 2; // Centro horizontalmente el recorte
      const cropY = (canvasHeight - cropHeight) / 2; // Centro verticalmente el recorte

      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;

      cropContext.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Resize the cropped image
      const resizeCanvas = document.createElement('canvas');
      const resizeContext = resizeCanvas.getContext('2d');

      const MAX_WIDTH = 300; // Max ancho para la imagen redimensionada
      const scaleSize = MAX_WIDTH / cropWidth;
      resizeCanvas.width = MAX_WIDTH;
      resizeCanvas.height = cropHeight * scaleSize;

      resizeContext.drawImage(cropCanvas, 0, 0, resizeCanvas.width, resizeCanvas.height);
      setResizedImage(resizeCanvas.toDataURL('image/png'));
    };
  };

  const switchCamera = () => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
  };

  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <h1>Captura de tarjeta de presentación</h1>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={videoConstraints}
          style={{ width: '100%', maxWidth: '640px' }}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '90%',
          height: '40%',
          transform: 'translate(-50%, -50%)',
          border: '4px solid red',
          boxSizing: 'border-box',
          pointerEvents: 'none'  // Para permitir interactuar con el video
        }}></div>
      </div>
      <br />
      <button onClick={capture}>Capturar</button>
      <button onClick={switchCamera}>Cambiar Cámara</button>
      {resizedImage && (
        <div>
          <h2>Imagen Capturada y Redimensionada:</h2>
          <img src={resizedImage} alt="Captured and Resized" style={{ width: '100%', maxWidth: '300px' }} />
        </div>
      )}
    </div>
  );
}
