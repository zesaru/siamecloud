import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { v4 } from "uuid";

const cardcapture = () => {
  const [uploading, setUploading] = useState(false);
  const [uuid, setUuid] = useState(v4());

  const uploadCard = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuid}.${fileExt}`;
      const filePath = `${fileName}`;
      console.log(`${file}`, `${fileName}`);
      console.log(filePath);

      let { error: uploadError } = await supabase.storage
        .from("cards")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }
    } catch (error) {
      alert("Error uploading card!");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        capture="camera"
        id="single"
        onChange={uploadCard}
        disabled={uploading}
      />
    </div>
  );
};

export default cardcapture;
