import uuid
import os
from flask import Flask, request, jsonify, session, url_for, redirect
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from authlib.integrations.flask_client import OAuth
from email_validator import validate_email, EmailNotValidError
from mongo_client import mongo_client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
oauth = OAuth(app)

CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "http://localhost:3000"}},
)

# Загрузка переменных окружения

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

# Настрой OAuth
oauth = OAuth(app)
google = oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    authorize_params={"prompt": "select_account"},
    access_token_url="https://oauth2.googleapis.com/token",
    access_token_params=None,
    client_kwargs={"scope": "openid email profile"},  # Важно!
    server_metadata_url=GOOGLE_DISCOVERY_URL,
)

bcrypt = Bcrypt(app)

# Режим отладки
DEBUG = bool(os.environ.get("DEBUG", True))

# Подключение к MongoDB
db = mongo_client.user_database
users_collection = db.users


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
    """
    Верификация нового пользователя по email.
    """
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
    """
    Аутентификация пользователя по email и паролю.
    """
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})  # Поиск пользователя по email.
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user["is_verified"]:
        return jsonify({"error": "Email not verified"}), 401

    session["user_id"] = str(user["_id"])  # Сохраняем user_id в cookies
    session["email"] = user["email"]

    return (
        jsonify({"message": "Login successful", "user": {"email": user["email"]}}),
        200,
    )


@app.route("/profile", methods=["GET"])
def profile():
    """
    Проверка сессии.
    """
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({"user": {"email": session["email"]}})


@app.route("/logout", methods=["POST"])
def logout():
    """
    Выход пользователя и удаление сессии.
    """
    session.clear()  # Удаляем данные из cookies
    return jsonify({"message": "Logout successful"})


@app.route("/google-login")
def google_login():
    """Редиректит пользователя на страницу авторизации Google."""
    redirect_uri = url_for("google_login_callback", _external=True)
    google = oauth.create_client("google")
    return google.authorize_redirect(redirect_uri)


@app.route("/google-login/callback")
def google_login_callback():
    """Получает токен от Google, сохраняет пользователя в БД и создаёт сессию."""

    token = google.authorize_access_token()
    email = token["userinfo"]["email"]

    # Проверяем, есть ли пользователь в базе
    user = users_collection.find_one({"email": email})
    if not user:
        # Если пользователя нет, создаём его
        new_user = {
            "id": str(uuid.uuid4()),  # Уникальный ID
            "email": email,
            "password": None,
            "is_verified": True,  # Email подтверждён
        }
        users_collection.insert_one(new_user)

    # Записываем пользователя в сессию
    user = users_collection.find_one({"email": email})
    session["user_id"] = str(user["_id"])  # Сохраняем user_id в cookies
    session["email"] = user["email"]
    return redirect(f"http://localhost:3000/?login=success&email={user["email"]}")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
