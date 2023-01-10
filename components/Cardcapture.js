import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { supabase } from "../utils/supabaseClient";
import { v4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

        let fetchRes = await toast.promise(
          fetch(`http://localhost:3000/api/cardrecognizer/${uuid}`),
          {
            pending: "Procesando Tarjeta",
            success: "Tarjeta reconocida 👌",
            error: "Ha ocurrido un error 🤯",
          }
        );

        let res = await fetchRes.json();

        if (res === undefined) {
          throw new Error(
            "Failed to extract data from at least one business card."
          );
        }

        console.log("Business Card Fields:");

        // For a list of fields that are contained in the response, please refer to
        // the "Supported fields" section at the following link:
        // https://aka.ms/formrecognizer/businesscardfields

        const FirstName =
          res.result.fields.ContactNames.values[0].properties.FirstName.value;
        const LastName =
          res.result.fields.ContactNames.values[0].properties.LastName.value;
        console.log(res.result);
        const Address = res.result.fields.Addresses.values[0].content;
        const CompanyName = res.result.fields.CompanyNames.values[0].content;
        const Email = res.result.fields.Emails.values[0].content;
        try {
          const result = await supabase.from("contactos").insert({
            first_name: FirstName,
            last_name: LastName,
            company_name: CompanyName,
            address: Address,
            email: Email,
          });
          console.log(result);
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      alert("Error uploading card!");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };
  return (
    <>
      <div style={{ width: 500 }}>
        {cardUrl ? (
          <img src={cardUrl} alt="Card" />
        ) : (
          <div
            className="avatar no-image"
            style={{ height: 600, width: 600 }}
          />
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
        <ToastContainer />
      </div>
    </>
  );
};

export default Cardcapture;
