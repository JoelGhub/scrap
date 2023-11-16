# Fase de construcción para React
FROM node:16 as build-stage
WORKDIR /app
# Copia los archivos de configuración de React y los instala
COPY package*.json ./
RUN npm install
# Copia el resto de los archivos de la aplicación React
COPY ./src ./src
COPY ./public ./public
COPY ./webpack.*.js ./
COPY .env* ./
COPY ./docs ./docs
COPY template.html ./

# Construye la aplicación React
RUN npm run build

# Fase de Flask
FROM python:3.8
WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Asegúrate de que esta ruta coincida con la carpeta de salida de tu compilación de React
COPY --from=build-stage /app/front/build ./static

# Configura el puerto en el que se expone la aplicación Flask
EXPOSE 80

# Comando para ejecutar la aplicación Flask
CMD ["python", "app.py"]

