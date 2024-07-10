import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';

export default function Home() {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // Cambia entre 'user' y 'environment'
  const [focusDistance, setFocusDistance] = useState(0); // Para controlar el enfoque

  const videoConstraints = {
    facingMode,
    width: 640,
    height: 480,
    advanced: [{ focusMode: "manual" }] // Intentar usar el control manual de enfoque
  };

  useEffect(() => {
    const applyFocus = async () => {
      const stream = webcamRef.current?.stream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        const settings = track.getSettings();

        if (capabilities.focusDistance && capabilities.focusMode.includes("manual")) {
          await track.applyConstraints({
            advanced: [{ focusDistance: focusDistance }]
          });
        } else {
          console.warn("El dispositivo no soporta ajustes manuales de enfoque.");
        }
      }
    };
    applyFocus();
  }, [focusDistance]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);

    // Crop and resize the image
    cropResizeAndEnhanceImage(imageSrc);
  }, [webcamRef]);

  const cropResizeAndEnhanceImage = (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const cropCanvas = document.createElement('canvas');
      const cropContext = cropCanvas.getContext('2d');

      const cropWidth = 400; // Ancho del recorte (ajusta según sea necesario)
      const cropHeight = 200; // Alto del recorte (ajusta según sea necesario)
      const canvasWidth = img.width;
      const canvasHeight = img.height;
      const cropX = (canvasWidth - cropWidth) / 2; // Centro horizontalmente el recorte
      const cropY = (canvasHeight - cropHeight) / 2; // Centro verticalmente el recorte

      cropCanvas.width = cropWidth;
      cropCanvas.height = cropHeight;

      cropContext.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Apply sharpening filter
      const imageData = cropContext.getImageData(0, 0, cropCanvas.width, cropCanvas.height);
      const sharpenedData = applySharpen(imageData);
      cropContext.putImageData(sharpenedData, 0, 0);

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

  const applySharpen = (imageData) => {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    const weights = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0,
    ];

    for (let pixels = 0; pixels < data.length / 4; pixels++) {
      const pixelX = (pixels % width) | 0;
      const pixelY = (pixels / width) | 0;
      let r = 0, g = 0, b = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = Math.min(width - 1, Math.max(0, pixelX + dx));
          const y = Math.min(height - 1, Math.max(0, pixelY + dy));
          const i = (y * width + x) * 4;
          const weightIndex = (dy + 1) * 3 + (dx + 1);
          const weight = weights[weightIndex];

          r += data[i] * weight;
          g += data[i + 1] * weight;
          b += data[i + 2] * weight;
        }
      }

      const outputIndex = (pixelY * width + pixelX) * 4;
      newData[outputIndex] = Math.min(255, Math.max(0, r));
      newData[outputIndex + 1] = Math.min(255, Math.max(0, g));
      newData[outputIndex + 2] = Math.min(255, Math.max(0, b));
      newData[outputIndex + 3] = data[outputIndex + 3];
    }

    return new ImageData(newData, width, height);
  };

  const switchCamera = () => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
  };

  const handleFocusChange = (event) => {
    setFocusDistance(event.target.value);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Captura de tarjeta de presentación</h1>
        <div className="relative inline-block w-full max-w-lg">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={videoConstraints}
            className="rounded-lg w-full"
          />
          <div className="absolute top-1/2 left-1/2 w-4/5 h-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-red-500 pointer-events-none"></div>
        </div>
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={capture}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Capturar
          </button>
          <button
            onClick={switchCamera}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Cambiar Cámara
          </button>
        </div>
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={10}
            value={focusDistance}
            onChange={handleFocusChange}
            className="w-full"
          />
          <label className="block mt-2">Ajuste de Enfoque: {focusDistance}</label>
        </div>
        {croppedImage && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Imagen Capturada y Redimensionada</h2>
            <img src={croppedImage} alt="Captured and Resized" className="max-w-full rounded-lg shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
