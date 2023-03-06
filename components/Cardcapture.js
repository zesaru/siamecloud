import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
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
        toast.success("Tarjeta subida 👌", { autoClose: 2000 });

        let fetchRes = await toast.promise(
          fetch(`/api/cardrecognizer/${uuid}`),
          {
            pending: "Procesando Tarjeta",
            success: "Tarjeta reconocida 👌",
            error: "Ha ocurrido un error 🤯",
          }
        );

        let res = await fetchRes.json();

        const FirstName =
          res.result.fields.ContactNames.values[0].properties?.FirstName.value;
        const LastName =
          res.result.fields.ContactNames.values[0].properties?.LastName.value;
        const Address = res.result.fields.Addresses?.values[0].content;
        const CompanyName = res.result.fields?.CompanyNames.values[0].content;
        const Email = res.result.fields.Emails?.values[0].content;
        const JobTitles = res.result.fields.JobTitles?.values[0].content;
        const WorkPhones = res.result.fields.WorkPhones?.values[0].content;
        const Faxes = res.result.fields.Faxes?.values[0].content;
        const Websites = res.result.fields.Websites?.values[0].content;

        try {
          const result = await supabase.from("contactos").insert({
            first_name: FirstName,
            last_name: LastName,
            company_name: CompanyName,
            address: Address,
            email: Email,
            job_title: JobTitles,
            work_phone: WorkPhones,
            fax: Faxes,
            website: Websites,
          });
          toast.success("Tarjeta ingresada 👌", { autoClose: 2000 });
        } catch (error) {
          toast.error("Fetch Failed" + error);
        }
      }
    } catch (error) {
      toast.error("Fetch Failed" + error);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <div>
        {cardUrl ? (
          <img src={cardUrl} alt="Card" />
        ) : (
          <div
            className="avatar no-image"
            style={{ height: 600, width: 600 }}
          />
        )}
        <div className="flex items-center justify-center gap-1 bg-blue-600 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
          <label className="text-white cursor-pointer p-5" htmlFor="single">
            {uploading ? "Uploading ..." : "Upload"}
          </label>
          <input
            className="hidden absolute "
            type="file"
            accept="image/*"
            capture="camera"
            id="single"
            onChange={uploadCard}
            disabled={uploading}
          />
        </div>
        <ToastContainer autoClose={2500} />
      </div>
    </div>
  );
};

export default Cardcapture;
