import { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { v4 } from "uuid";

const Cardcapture = () => {
  const supabase = useSupabaseClient();

  const [cardUrl, setCardUrl] = useState("");
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
      let { error: uploadError } = await supabase.storage
        .from("cards")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      } else {
        const url = `https://yzzrsmaxlukpahicprzp.supabase.co/storage/v1/object/public/cards/${filePath}`;
        setCardUrl(url);
        
      }
    } catch (error) {
      alert("Error uploading card!");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div style={{ width: 500 }}>
      {cardUrl ? (
        <img src={cardUrl} alt="Card" />
      ) : (
        <div className="avatar no-image" style={{ height: 600, width: 600 }} />
      )}
      <div>
        <label className="button primary block" htmlFor="single">
          {uploading ? "Uploading ..." : "Upload"}
        </label>
        <input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          accept="image/*"
          capture="camera"
          id="single"
          onChange={uploadCard}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default Cardcapture;