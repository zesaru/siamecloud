import React from "react";

const cardcapture = () => {
  return (
    <div>
      <input type="file" accept="image/*" capture="camera" />
    </div>
  );
};

export default cardcapture;
