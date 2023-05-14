import os
import requests
from flask import Flask, render_template, flash, redirect, session, g
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy.exc import IntegrityError
from forms import UserAddForm, LoginForm, EditUserForm
from models import User, Game
from random import randint

from my_secrets import MY_SECRET_KEY, DB_NAME
from pkmn_list import pokemon_list

# from forms import 
from models import db, connect_db

CURR_USER_KEY = "curr_user"
BASE_API_URL = "https://pokeapi.co/api/v2/"

app = Flask(__name__)
app.app_context().push()

app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', DB_NAME))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', MY_SECRET_KEY)
toolbar = DebugToolbarExtension(app)

connect_db(app)
# db.create_all()

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
    """Homepage - Games take place here"""
    pkmn = pokemon_list
    return render_template('game.html', pkmn=pkmn)


@app.route("/login", methods=['GET', 'POST'])
def login():
    """Handle a user attempting to log in"""
    form=LoginForm()
    
    if form.validate_on_submit():
        user = User.authenticate(form.username.data, form.password.data)

        if user:
            do_login(user)
            flash(f"Hello, {user.username}!", "success")
            return redirect("/")

    return render_template('login.html', form=form)


@app.route("/logout")
def logout():
    """Handle a user logging out"""
    do_logout()
    flash("Logged out!", "success")
    return redirect('/')


@app.route("/signup", methods=['GET', 'POST'])
def signup():
    """Handle a user signing up. Also determines which pokemon is the user's favorite pokemon"""

    form=UserAddForm()
    form.fav_pkmn.choices = [(idx, f"{idx} - {pkmn}") for (idx, pkmn) in enumerate(['None'] + pokemon_list[:])]

    if form.validate_on_submit():
        dex_number = form.fav_pkmn.data

        # Get image URL to send to User.signup()
        if(dex_number == 0):
            image_url = None
        else:
            try:
                resp = requests.get(f"{BASE_API_URL}/pokemon/{dex_number}")
                img_data = resp.json()['sprites']['other']['official-artwork']
                image_url = img_data['front_shiny'] if (randint(1, 512) == 512) else img_data['front_default']
            except:
                image_url = None
                flash("An error occursed with your favorite pokemon. Default image set.", "danger")
        
        # Sign up the user using signup classmethod
        try:
            user = User.signup(
                username = form.username.data,
                password = form.password.data,
                email    = form.email.data,
                favorite = dex_number,
                img_url  = image_url
            )
            db.session.commit()

        except IntegrityError as e:
            # Determine if either username or email already exists.
            # Only first error caught & used for flash messages
            msg = e.orig.diag.message_detail
            idx = msg.find(')')
            msg = f"{msg[5:idx]} already exists!".capitalize()

            flash(msg, "danger")
            return render_template('signup.html', form=form)
        
        # Log in & redirect to homepage
        do_login(user)
        return redirect("/")
        
    return render_template('signup.html', form=form)


@app.route("/profile/<int:user_id>", methods=['GET', 'POST'])
def user_profile(user_id):
    """Allow user to update their email, password, and/or favorite pokemon (updates profile picture)"""
    user = User.query.get_or_404(user_id)
    form=EditUserForm(obj=user)

    choices = [(idx, f"{idx} - {pkmn}") for (idx, pkmn) in enumerate(['None'] + pokemon_list[:])]
    form.fav_pkmn.choices = choices
    
    if form.validate_on_submit():
        # Validate user
        user = User.authenticate(g.user.username, form.password.data)
        if(user):
            if(form.new_password.data):
                pwd = form.new_password.data
                User.update_pass(user, pwd)
            if(form.fav_pkmn.data != g.user.fav_pkmn):
                g.user.fav_pkmn = form.fav_pkmn.data
                
                # Update image URL
                if(form.fav_pkmn.data == 0):
                    g.user.img_url = None
                else:
                    try:
                        resp = requests.get(f"{BASE_API_URL}/pokemon/{form.fav_pkmn.data}")
                        img_data = resp.json()['sprites']['other']['official-artwork']
                        image_url = img_data['front_shiny'] if (randint(1, 512) == 512) else img_data['front_default']
                    except:
                        image_url = None
                        flash("An error occursed with your favorite pokemon. Default image set.", "danger")
                    g.user.img_url = image_url
                
            g.user.email = form.email.data
        db.session.commit()

    # Must be after form validation or will not update
    junk, fav_pokemon = choices[g.user.fav_pkmn]
    
    return render_template('profile.html', form=form, fav_pokemon=fav_pokemon)

@app.route("/leaderboard")
def leaderboard():
    """Display leaderboards for all players"""

    return render_template('leaderboard.html')