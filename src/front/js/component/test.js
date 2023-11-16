import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";
import "../../styles/Test.css"; // Import the CSS file

const Test = () => {
  const { store, actions } = useContext(Context);
  const userId = localStorage.getItem('user_id'); // Asegúrate de que 'user_id' se almacene correctamente en el localStorage
  

  useEffect(() => {
    actions.getUserInfo(); // Asume que tienes una acción que hace esta solicitud
}, []);

  const handleDownloadClick = async (filename) => {
    try {
       
      const downloadUrl = `${process.env.BACKEND_URL}/api/download/${userId}/${filename}`;
      const response = await fetch(downloadUrl);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error al descargar el archivo.');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  return (
    <div className="test-container">
        {localStorage.getItem("token") ? (
            <>
                <p className="download-info">Selecciona un archivo para descargar:</p>
                {store.fileList && store.fileList.length > 0 ? (
                    store.fileList.map((file, index) => (
                        <button key={index} className="download-button" onClick={() => handleDownloadClick(file)}>
                            Descargar {file}
                        </button>
                    ))
                ) : (
                    <p>No hay archivos disponibles para descargar.</p>
                )}
            </>
        ) : (
            <p>Debes iniciar sesión para descargar el archivo.</p>
        )}
    </div>
  );
};

export default Test;
