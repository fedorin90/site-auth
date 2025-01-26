from flask import Flask, request, jsonify
from oauthlib.oauth2 import WebApplicationClient
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from email_validator import validate_email, EmailNotValidError
from mongo_client import mongo_client
import uuid
from google.auth.transport.requests import Request
from google.oauth2 import id_token

from dotenv import load_dotenv
import os


app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "http://localhost:3000"}},
)

# Загрузка переменных окружения
load_dotenv()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

client = WebApplicationClient(GOOGLE_CLIENT_ID)

bcrypt = Bcrypt(app)
jwt = JWTManager(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Режим отладки
DEBUG = bool(os.environ.get("DEBUG", True))

# Подключение к MongoDB
db = mongo_client.user_database
users_collection = db.users


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/register", methods=["POST"])
def register():
    """
    Регистрация нового пользователя с email и паролем.
    """
    data = request.json  # Получение JSON-данных из запроса
    email = data.get("email")
    password = data.get("password")

    # Проверка корректности email
    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400

    # Проверка, существует ли пользователь
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # Хэширование пароля для безопасности
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    # Создание нового пользователя
    new_user = {
        "id": str(uuid.uuid4()),  # Уникальный ID
        "email": email,
        "password": hashed_password,  # Хранение хэшированного пароля
        "is_verified": False,  # Email ещё не подтверждён
    }
    users_collection.insert_one(new_user)  # Сохранение пользователя в MongoDB

    # TODO: Здесь можно добавить отправку email для подтверждения
    print(f"Подтверждающая ссылка: http://localhost:3000/verify/{new_user['id']}")

    return jsonify({"message": "User registered. Please verify your email."}), 201


@app.route("/verify/<user_id>", methods=["GET"])
def verify_email(user_id):
    user = users_collection.find_one({"id": user_id})  # Поиск пользователя по ID.
    if not user:
        return jsonify({"error": "Invalid verification link"}), 400

    if user["is_verified"]:
        return jsonify({"message": "Email is already verified"}), 200

    users_collection.update_one(
        {"id": user_id}, {"$set": {"is_verified": True}}
    )  # Обновление статуса.
    return jsonify({"message": "Email verified successfully"}), 200


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})  # Поиск пользователя по email.
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user["is_verified"]:
        return jsonify({"error": "Email not verified"}), 401

    # Создание токена
    access_token = create_access_token(
        identity={"id": user["id"], "email": user["email"]}
    )
    return (
        jsonify({"access_token": access_token, "message": "Successfully logged in"}),
        200,
    )


@app.route("/login/google", methods=["POST"])
def login_google():
    """
    Аутентификация пользователя через Google OAuth.
    """


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
