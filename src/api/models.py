from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    is_active = db.Column(db.Boolean(), nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # No serialices la contraseña, ya que es un problema de seguridad
        }

class ScrapedData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    url = db.Column(db.String(2048), nullable=False)
    content = db.Column(db.Text, nullable=False)
    max_pages = db.Column(db.Integer, nullable=False)
    max_characters = db.Column(db.Integer, nullable=False)

    user = db.relationship('User', backref=db.backref('scraped_data', lazy=True))

    def __init__(self, user_id, url, content, max_pages, max_characters):
        self.user_id = user_id
        self.url = url
        self.content = content
        self.max_pages = max_pages
        self.max_characters = max_characters

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "url": self.url,
            "content": self.content,
            "max_pages": self.max_pages,
            "max_characters": self.max_characters
        }