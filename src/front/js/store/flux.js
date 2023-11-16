const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			user_id: null ,
			auth: false,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			fileList: []
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},
			login: async (email, password) => {
				try {
				  const response = await fetch(`${process.env.BACKEND_URL}/api/login`, {
					method: 'POST',
					body: JSON.stringify({ email, password }),
					headers: {
					  'Content-Type': 'application/json',
					},
				  });
				  console.log(response.status);
				  if (response.status === 200) {
					const data = await response.json();
					localStorage.setItem('token', data.access_token);
					
					// Here you can set the global state indicating that the user is authenticated
					setStore({
					  user_id: data.user_id,
					  auth: true,
					});
					
					// You can now return a value or take additional actions as needed
					return true;
				  } else {
					// Handle any other statuses or errors
					const errorData = await response.json();
					throw new Error(errorData.message);
				  }
				} catch (err) {
				  console.error("Error during login:", err);
				  
				  // Update the global state with the error information
				  setStore({
					auth: false,
					error: err.message,
				  });
				  
				  return false;
				}
				
			  },
			  scrapeData: async (user_id, url, maxPages, maxCharacters) => {
				try {
				   // Assuming the token is stored in localStorage
				  const response = await fetch(`${process.env.BACKEND_URL}/api/scrape`, {
					method: 'POST',
					body: JSON.stringify({ 
						user_id, 
						url, 
						max_pages: maxPages, // assuming maxPages from function call maps to max_pages expected by Flask
						max_characters: maxCharacters, }),
					headers: {
					  'Content-Type': 'application/json',
					  'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the token in the Authorization header
					},
				  });
				  if (response.status === 200) {
					// Si la solicitud es exitosa, puedes realizar acciones adicionales o devolver un valor si es necesario
					return true;
				  } else {
					// Maneja cualquier otro estado o errores
					const errorData = await response.json();
					throw new Error(errorData.message);
				  }
				} catch (err) {
					console.error("Error durante la solicitud de scraping:", err);
					if (err.response) {
					  // Si hay una respuesta del servidor, imprime también esta información
					  console.log("Respuesta del servidor:", await err.response.json());
					}
					return false;
				  }
			  },
			  getScrapedData: async (userId) => {
				try {
				  const response = await fetch(`${process.env.BACKEND_URL}/api/scraped-data/` +userId); 
				  // Ajusta la URL de la ruta de tu backend
				  if (response.ok) {
					const data = await response.json();
					// Aquí puedes hacer algo con los datos, como almacenarlos en el estado del componente
					console.log(data); // Muestra los datos en la consola para verificar
				  } else {
					console.error('Error al obtener los datos scrapeados.');
				  }
				} catch (error) {
				  console.error('Error de red:', error);
				}
			  },
			  getUserInfo: async () => {
				const token = localStorage.getItem('token'); // Tu JWT
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/protected`, {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${token}`
						}
					});
			
					if (response.ok) {
						const data = await response.json();
						localStorage.setItem('user_id', data.user_id);
						console.log("flux : " + data.user_id)
					} else {
						console.error('Error al obtener la información del usuario.');
					}
				} catch (error) {
					console.error('Error de red:', error);
				}
			},
			listFiles: async () => {
				const user_id = localStorage.getItem('user_id'); 
				const token = localStorage.getItem('token'); // Tu JWT
				if (token) {
					try {
						if (!user_id) {
							console.error('ID de usuario no encontrado.');
							return;
						}
						const response = await fetch(`${process.env.BACKEND_URL}/api/list-files/${user_id}`, {
							method: 'GET',
							headers: {
								'Authorization': `Bearer ${token}`
							}
						});
			
						if (response.ok) {
							const data = await response.json();
						    setStore({
								fileList: data,
							  })
						} else {
							console.error('Error al obtener la lista de archivos');
						}
					} catch (error) {
						console.error('Error de red:', error);
					}
				} else {
					console.error('Token no disponible');
				}
			},
			
		}
	};
};

export default getState;
