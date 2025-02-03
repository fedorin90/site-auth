import uuid
import os
import datetime
import jwt
from flask import Flask, request, jsonify, session, url_for, redirect
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_mail import Mail, Message
from authlib.integrations.flask_client import OAuth
from email_validator import validate_email, EmailNotValidError
from mongo_client import mongo_client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Загрузка переменных окружения
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT"))
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"

mail = Mail(app)

# Настройка Cors
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": "http://localhost:3000"}},
)

# Настройка OAuth
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

# Настройка хеширования паролей
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
    name = data.get("name")
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
        "name": name,
        "photo": None,
        "password": hashed_password,  # Хранение хэшированного пароля
        "is_verified": False,  # Email ещё не подтверждён
    }
    users_collection.insert_one(new_user)  # Сохранение пользователя в MongoDB

    # отправка email для подтверждения
    token = jwt.encode(
        {
            "user_id": new_user["id"],
            "exp": datetime.datetime.now(datetime.timezone.utc)
            + datetime.timedelta(hours=1),
        },
        app.config["JWT_SECRET_KEY"],
        algorithm="HS256",
    )
    # Генерируем токен на 1 час
    verify_link = f"http://localhost:3000/verify/{token}"  # Ссылка для верификации

    # Отправляем email
    msg = Message(
        "Verify Your Email", sender=app.config["MAIL_USERNAME"], recipients=[email]
    )
    msg.body = f"Click the link to verify your email: {verify_link}"
    mail.send(msg)

    return (
        jsonify(
            {"message": "User registered. Check your email to verify your account."}
        ),
        201,
    )


@app.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    """
    Верификация нового пользователя по email.
    """
    # Проверяет токен и подтверждает email
    try:
        data = jwt.decode(token, app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
        user_id = data["user_id"]
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Verification link has expired"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid verification token"}), 400

    # Поиск пользователя по ID.
    user = users_collection.find_one({"id": user_id})
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
        return jsonify({"error": "Incorrect email or password"}), 401

    if not user["is_verified"]:
        return jsonify({"error": "Email not verified"}), 401

    # Сохраняем user в cookies
    session["user_id"] = str(user["_id"])
    session["email"] = user["email"]
    session["name"] = user["name"]
    session["photo"] = user["photo"]

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

    return jsonify(
        {
            "user": {
                "email": session["email"],
                "name": session["name"],
                "photo": session["photo"],
            }
        }
    )


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
    google_client = oauth.create_client("google")
    return google_client.authorize_redirect(redirect_uri)


@app.route("/google-login/callback")
def google_login_callback():
    """Получает токен от Google, сохраняет пользователя в БД и создаёт сессию."""

    token = google.authorize_access_token()
    email = token["userinfo"]["email"]
    photo = token["userinfo"].get("picture", "/default-avatar.png")
    name = token["userinfo"].get("name", "")

    # Проверяем, есть ли пользователь в базе
    user = users_collection.find_one({"email": email})
    if not user:
        # Если пользователя нет, создаём его
        new_user = {
            "id": str(uuid.uuid4()),  # Уникальный ID
            "email": email,
            "photo": photo,
            "name": name,
            "password": None,
            "is_verified": True,  # Email подтверждён
        }
        users_collection.insert_one(new_user)

    # Записываем пользователя в сессию
    user = users_collection.find_one({"email": email})
    # Сохраняем user в cookies
    session["user_id"] = str(user["_id"])
    session["email"] = user["email"]
    session["photo"] = user["photo"]
    session["name"] = user["name"]
    return redirect(f"http://localhost:3000/?login=success&email={user["email"]}")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
