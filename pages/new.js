import { useRef, useEffect, useState } from 'react';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isRearCamera, setIsRearCamera] = useState(true); // Para alternar entre cámara frontal y trasera
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function getStream() {
      const videoInputs = await navigator.mediaDevices.enumerateDevices().then(devices => (
        devices.filter(device => device.kind === 'videoinput')
      ));
      setDevices(videoInputs);

      if (videoInputs.length) {
        await switchCamera(videoInputs[isRearCamera ? 0 : 1]?.deviceId || videoInputs[0]?.deviceId);
      }
    }

    getStream();
  }, [isRearCamera]);

  const switchCamera = async (deviceId) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined
        }
      });

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    }
  };

  const toggleCamera = () => {
    setIsRearCamera(prevState => !prevState);
  };

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

      const cropWidth = 400; // Ancho del recorte (ajusta según sea necesario)
      const cropHeight = 200; // Alto del recorte (ajusta según sea necesario)
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;
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
          width: '65%', // Ancho del marco en porcentaje
          height: '40%', // Alto del marco en porcentaje
          transform: 'translate(-50%, -50%)',
          border: '4px solid red',
          boxSizing: 'border-box',
          pointerEvents: 'none'
        }}></div>
      </div>
      <br />
      <button onClick={capturePhoto}>Capturar</button>
      <button onClick={toggleCamera}>Cambiar Cámara</button>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
      {croppedImage && (
        <div>
          <h2>Imagen Capturada y Redimensionada:</h2>
          <img src={croppedImage} alt="Captured and Resized" style={{ width: '100%', maxWidth: '300px' }} />
        </div>
      )}
    </div>
  );
}
