from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from email_validator import validate_email, EmailNotValidError
from pymongo import MongoClient
import uuid
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
load_dotenv()
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

client = MongoClient("mongodb://localhost:27017/")
db = client["user_database"]
users_collection = db["users"]
