import os

from flask import Flask, render_template, request, flash, redirect, session, g
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy.exc import IntegrityError
from forms import UserAddForm, LoginForm, EditUserForm
from models import User, Game

from my_secrets import MY_SECRET_KEY, DB_NAME
from pkmn_list import pokemon_list

# from forms import 
from models import db, connect_db

CURR_USER_KEY = "curr_user"

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', DB_NAME))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', MY_SECRET_KEY)
toolbar = DebugToolbarExtension(app)

connect_db(app)

# ******************** BEFORE_REQUEST ********************
@app.before_request
def add_user_to_g():
    """If logged in, add curr user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])
    else:
        g.user = None


def do_login(user):
    """Log in user."""
    session[CURR_USER_KEY] = user.id


def do_logout():
    """Logout user."""
    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]

# ******************** ROUTES ********************
@app.route("/")
def homepage():
    return render_template('base.html')


@app.route("/login", methods=['GET', 'POST'])
def login():
    form=LoginForm()
    
    if form.validate_on_submit():
        # Login stuff
        print('logged in!')

    return render_template('login.html', form=form)


@app.route("/logout")
def logout():
    
    # Do logout stuff
    return redirect('/')


@app.route("/signup", methods=['GET', 'POST'])
def signup():

    form=UserAddForm()
    form.fav_pkmn.choices = [(idx, f"{idx} - {pkmn}") for (idx, pkmn) in enumerate(['None'] + pokemon_list[:])]

    if form.validate_on_submit():
        # Register stuff
        print("Registered!" )
        
    return render_template('signup.html', form=form)


@app.route("/profile/<int:user_id>", methods=['GET', 'POST'])
def user_profile(user_id):
    form=EditUserForm()
    return render_template('profile.html', form=form)

@app.route("/leaderboard")
def leaderboard():

    return render_template('leaderboard.html')