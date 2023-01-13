import { supabase } from "../utils/supabaseClient";
import { useEffect, useState } from "react";

const ContactList = () => {
  const [contactos, setContactos] = useState([]);

  const contactosreailtime = supabase
    .channel("custom-all-channel")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "contactos" },
      (payload) => {
        fechData();
      }
    )
    .subscribe();

  async function fechData() {
    let { data: contactos, error } = await supabase
      .from("contactos")
      .select("*");
    setContactos(contactos);
  }

  useEffect(() => {
    fechData();
  }, []);

  return (
    <>
      <ul>
        {contactos.map((contacto) => (
          <li key={contacto.id}>{contacto.id}</li>
        ))}
      </ul>
    </>
  );
};

export default ContactList;
