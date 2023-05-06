
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from random import randint

bcrypt = Bcrypt()
db = SQLAlchemy()

class User(db.Model):
    """Users table"""
    __tablename__ = "users"

    def __repr__ (self):
        u = self
        return f"<User id={u.id},  username={u.username},  email={u.email}>"

    id       = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.Text, nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)
    email    = db.Column(db.Text, nullable=False, unique=True)
    fav_pkmn = db.Column(db.Integer, nullable=True)

    @classmethod
    def signup(cls, username, email, password, image_url):
        """Sign up user.
        Hashes password and adds user to system.
        """

        hashed_pwd = bcrypt.generate_password_hash(password).decode('UTF-8')

        user = User(
            username=username,
            email=email,
            password=hashed_pwd
        )

        db.session.add(user)
        return user
    
    @classmethod
    def authenticate(cls, username, password):
        """Find user with `username` and `password`.

        This is a class method (call it on the class, not an individual user.)
        It searches for a user whose password hash matches this password
        and, if it finds such a user, returns that user object.

        If can't find matching user (or if password is wrong), returns False.
        """

        user = cls.query.filter_by(username=username).first()

        if user:
            is_auth = bcrypt.check_password_hash(user.password, password)
            if is_auth:
                return user

        return False

class Game(db.Model):
    """Games table"""
    __tablename__ = "pkmn_games"

    id          = db.Column(db.Integer, primary_key = True)
    user_id     = db.Column(db.Text, db.ForeignKey('users.id', ondelete='cascade'))
    score       = db.Column(db.Integer)
    # Game mode 0 if default, 1 if Alt game mode
    game_mode   = db.Column(db.Integer)
    # True if Win, False if Loss
    outcome     = db.Column(db.Boolean, default=False)

def connect_db(app):
    """Connects this DB to provided Flask app.
    It should called in app.py.
    """

    db.app = app
    db.init_app(app)
