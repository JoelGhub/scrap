"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint,send_from_directory
from api.models import db, User, ScrapedData
import json
from api.utils import generate_sitemap, APIException
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager
# # flask jwt paquete de instalacion
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
import datetime
import requests
from bs4 import BeautifulSoup
import os

api = Blueprint('api', __name__)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/register', methods=['POST'])
def register():
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    
    if email is None or password is None:
        return jsonify({"msg": "Missing email or password"}), 400
    
    if User.query.filter_by(email=email).first() is not None:
        return jsonify({"msg": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password=hashed_password, is_active=True)
    
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token), 201

@api.route("/login", methods=["POST"])
def login():
    # Extracting email and password from JSON request
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    # Check if both email and password are provided
    if not (email and password):
        return jsonify({'message': 'Missing email or password'}), 400

    # Query the User table for the given email
    user = User.query.filter_by(email=email).one_or_none()

    # If user not found or password does not match, return an error
    if not user or user.password != password:
        return jsonify({"msg": "Bad username or password"}), 401


    # Set token expiration period
    expired = datetime.timedelta(minutes=240)

    # Generate access token with the provided identity and expiration
    access_token = create_access_token(identity=email, expires_delta=expired)

    user_id = user.id

    return jsonify({"access_token": access_token, "user_id": user_id}), 200

@api.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_email = get_jwt_identity()

    # Buscar el usuario por email para obtener su ID
    user = User.query.filter_by(email=current_user_email).first()

    # Verificar que el usuario existe
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    # Devolver el email y el ID del usuario
    return jsonify(email=current_user_email, user_id=user.id), 200




#SCRAPING


@api.route('/scrape', methods=['POST'])
@jwt_required()
def scrape_website():
    current_user_id = get_jwt_identity()
    try:
        # Obtener datos del formulario
        user_id = request.json.get('user_id', None)
        url = request.json.get('url', None)
        max_pages = int(request.json.get('max_pages'))
        max_characters = int(request.json.get('max_characters'))
    
        # Realizar solicitud GET para obtener el contenido de la URL principal
        response = requests.get(url)
        response.raise_for_status()

        # Analizar el contenido HTML utilizando BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Carpeta donde se almacenarán los archivos
        folder_path = f'/workspace/react-flask-hello/user_id_{user_id}_html_files'  # Reemplaza con la ruta adecuada

        # Verificar si la carpeta existe, de lo contrario, crearla
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        # Función para scrapear una página y sus enlaces recursivamente
        def scrape_page_recursive(url, depth):
            if depth >= max_pages:
                return

            # Realizar solicitud GET para obtener el contenido de la URL actual
            print(f"Raspando página: {url}")

            response = requests.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            body_content = soup.find('body').prettify()

            # Verificar la cantidad de caracteres
            if len(body_content) > max_characters:
                print(f"La página {url} supera el límite de caracteres permitidos.")
                return

            # Crear un archivo para guardar el contenido
            file_name = f'{user_id}_page_{depth}.html'
            file_path = os.path.join(folder_path, file_name)

            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(body_content)

            # Encontrar enlaces en la página y scrapearlos recursivamente
            links = soup.find_all('a', href=True)
            for link in links:
                next_url = link['href']
                if next_url.startswith('http'):
                    scrape_page_recursive(next_url, depth + 1)

        # Iniciar el scraping desde la página principal
        scrape_page_recursive(url, depth=0)

        return jsonify({'message': 'Scraping successful and data saved to the server.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/download/<int:user_id>/<path:filename>', methods=['GET'])

def download_file(user_id, filename):
    
    print(user_id)
    folder_path = f'/workspace/react-flask-hello/user_id_{user_id}_html_files/'
    file_path = os.path.join(folder_path, filename)

    if not os.path.isfile(file_path):
        # El archivo no se encuentra en el servidor
        return jsonify({'error': 'Archivo no encontrado'}), 404

    # Usa Flask para enviar el archivo al cliente
    try:
        return send_from_directory(folder_path, filename, as_attachment=True)
    except Exception as e:
        return jsonify({'error': f'Error al descargar el archivo: {str(e)}'}), 500
    
@api.route('/list-files/<int:user_id>', methods=['GET'])
@jwt_required()
def list_files(user_id):
    folder_path = f'/workspace/react-flask-hello/user_id_{user_id}_html_files/'
    
    if not os.path.exists(folder_path):
        return jsonify({'error': 'No se encontraron archivos'}), 404

    files = os.listdir(folder_path)
    return jsonify(files), 200