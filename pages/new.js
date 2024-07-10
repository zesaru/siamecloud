//add newpage

import { useRef, useEffect, useState } from 'react';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = videoRef.current;
          if (video) {
            video.srcObject = stream;
            video.play();
          }
        })
        .catch(err => {
          console.error("Error accessing the camera: ", err);
        });
    }
  }, []);

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = canvas.toDataURL('image/png');
      setCapturedImage(image);
      
      // Crop and resize the image
      cropAndResizeImage(image);
    }
  };

  const cropAndResizeImage = (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const cropCanvas = document.createElement('canvas');
      const cropContext = cropCanvas.getContext('2d');

      const cropWidth = 640; // Width of the crop
      const cropHeight = 320; // Height of the crop
      const cropX = (img.width - cropWidth) / 2; // Center crop horizontally
      const cropY = (img.height - cropHeight) / 2; // Center crop vertically

      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;

      cropContext.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Resize the cropped image
      const resizeCanvas = document.createElement('canvas');
      const resizeContext = resizeCanvas.getContext('2d');

      const MAX_WIDTH = 300; // Setting max width for the resized image
      const scaleSize = MAX_WIDTH / cropWidth;
      resizeCanvas.width = MAX_WIDTH;
      resizeCanvas.height = cropHeight * scaleSize;

      resizeContext.drawImage(cropCanvas, 0, 0, resizeCanvas.width, resizeCanvas.height);
      setCroppedImage(resizeCanvas.toDataURL('image/png'));
    };
  };

  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <h1>Captura de tarjeta de presentación</h1>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video ref={videoRef} style={{ width: '100%', maxWidth: '600px' }}></video>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '80%',
          height: '40%',
          transform: 'translate(-50%, -50%)',
          border: '4px solid red',
          boxSizing: 'border-box',
          pointerEvents: 'none'
        }}></div>
      </div>
      <br />
      <button onClick={capturePhoto}>Capturar</button>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="540"></canvas>
      {croppedImage && (
        <div>
          <h2>Imagen Capturada y Redimensionada:</h2>
          <img src={croppedImage} alt="Captured and Resized" style={{ width: '100%', maxWidth: '300px' }} />
        </div>
      )}
    </div>
  );
}
