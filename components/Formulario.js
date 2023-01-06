import React from "react";
import { Form, Field } from "react-final-form";

const Formulario = () => {
  const nombre = "cesar";
  const onSubmit = (values) => {
    // aquí puedes procesar los datos del formulario
  };

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, form, submitting, pristine, values }) => (
        <div class="max-w-2xl mx-auto bg-white p-16">
          <form onSubmit={handleSubmit}>
            <div class="grid gap-6 mb-6 lg:grid-cols-2">
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  htmlFor="vocativo"
                >
                  Vocativo
                </label>
                <Field
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="vocativo"
                  name="vocativo"
                  type="text"
                  component="input"
                  placeholder="Mr. Mrs. Mr."
                />
              </div>
              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  htmlFor="nombre"
                >
                  Nombre
                </label>
                <Field
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id="nombre"
                  name="nombre"
                  type="text"
                  component="input"
                  initialValue={nombre}
                />
              </div>
            </div>
          </form>
        </div>
      )}
    />
  );
};
export default Formulario;
