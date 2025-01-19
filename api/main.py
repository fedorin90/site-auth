from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from email_validator import validate_email, EmailNotValidError
from mongo_client import mongo_client
import uuid
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
load_dotenv()
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
DEBUG = bool(os.environ.get("DEBUG", True))


db = mongo_client.user_database
users_collection = db.users


@app.route("/register", methods=["POST"])
def register():
    data = request.json  # Получение данных из запроса.
    email = data.get("email")
    password = data.get("password")

    # Проверка email
    try:
        validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": str(e)}), 400

    # Проверка, существует ли пользователь
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # Хэширование пароля
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    # Создание нового пользователя
    new_user = {
        "id": str(uuid.uuid4()),  # Уникальный ID пользователя.
        "email": email,
        "password": hashed_password,  # Хэшированный пароль.
        "is_verified": False,  # Пользователь ещё не подтвердил email.
    }
    users_collection.insert_one(new_user)  # Сохранение в базе данных.

    # Отправка подтверждения email (упрощённый пример)
    print(f"Подтверждающая ссылка: http://localhost:3000/verify/{new_user['id']}")

    return jsonify({"message": "User registered. Please verify your email."}), 201


@app.route("/verify/<user_id>", methods=["GET"])
def verify_email(user_id):
    user = users_collection.find_one({"id": user_id})  # Поиск пользователя по ID.
    if not user:
        return jsonify({"error": "Invalid verification link"}), 400

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
    return jsonify({"access_token": access_token}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
