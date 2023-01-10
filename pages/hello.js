import { supabase } from "../utils/supabaseClient";
import { useEffect } from "react";

const hello = () => {
  useEffect(() => {
    const subscription = supabase
      .channel("custom-insert-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contactos" },
        (payload) => {
          console.log("Change received!", payload);
        }
      )
      .subscribe();

    // Llamar a unsubscribe cuando se desmonte el componente o se cambie el valor de una dependencia
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Pasar un arreglo vacío como segundo argumento para que el hook solo se ejecute una vez
};

export default hello;
