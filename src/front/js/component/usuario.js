const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return token ? true : false;
};

import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import ScrapedDataList from "./scrapedDataList";
import { Navigate } from "react-router-dom";
import "../../styles/UserPage.css"; // Import the CSS file
import Swal from "sweetalert2";

const UserPage = () => {
  const { store, actions } = useContext(Context);
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState("");
  const [maxCharacters, setMaxCharacters] = useState("");
  const user_id = localStorage.getItem("user_id");

  const handleScrapeButtonClick = async (e) => {
    e.preventDefault(); // Prevents the default form submission behavior

    console.log(user_id);
    console.log(url);
    console.log(maxPages);
    console.log(maxCharacters);

    try {
      // Await the result of the scrapeData function and handle it accordingly
      const result = await actions.scrapeData(
        user_id,
        url,
        maxPages,
        maxCharacters
      );

      // Provide feedback based on the result
      if (result) {
        console.log("Scraping completado con éxito");
        Swal.fire({
          title: "¡Éxito!",
          text: "Scraping completado con éxito.",
          icon: "success",
          confirmButtonText: "Ok",
        });
      } else {
        console.log("Scraping fallido o sin datos");
        Swal.fire({
          title: "Error",
          text: "Hubo un problema con el scraping.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      // Handle any errors that occur during the scraping process
      console.error("Error durante el scraping:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo completar el scraping.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  // If the user is authenticated, show the user page
  return (
    <div className="userpage-container">
      <div className="form-container">
        <h1 className="title">Formulario de Scraping</h1>
        <form onSubmit={handleScrapeButtonClick}>
          <div>
            <label htmlFor="url">URL:</label>
            <input
              type="text"
              id="url"
              name="url"
              required
              className="w-full p-2 border rounded-md transition duration-200 hover:border-blue-500"
              onChange={(e) => setUrl(e.target.value)}
              value={url}
            />
            <span>
              <i
                className="fas fa-info-circle"
                title="Introduce una URL válida para iniciar el scraping"
              ></i>
            </span>
          </div>

          <div>
            <label htmlFor="pages">Páginas máximas a scrapear:</label>
            <input
              type="number"
              id="pages"
              required
              name="max_pages"
              className="w-full p-2 border rounded-md transition duration-200 hover:border-blue-500"
              onChange={(e) => setMaxPages(e.target.value)}
              value={maxPages}
            />
            <span>
              <i
                className="fas fa-info-circle"
                title="Número máximo de páginas a scrapear"
              ></i>
            </span>
          </div>

          <div>
            <label htmlFor="characters">Caracteres máximos a scrapear:</label>
            <input
              type="number"
              id="characters"
              required
              name="max_characters"
              className="w-full p-2 border rounded-md transition duration-200 hover:border-blue-500"
              onChange={(e) => setMaxCharacters(e.target.value)}
              value={maxCharacters}
            />
            <span>
              <i
                className="fas fa-info-circle"
                title="Número máximo de caracteres a scrapear por página"
              ></i>
            </span>
          </div>

          <button type="submit">Iniciar Scraping</button>
        </form>
        <button
          onClick={() => (window.location.href = "/without_sitemap")}
          className="change-form-button"
        >
          Cambiar a formulario sin sitemap
        </button>
      </div>
    </div>
  );
};

export default UserPage;
