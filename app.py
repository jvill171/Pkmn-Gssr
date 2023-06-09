import os
import requests
from flask import Flask, render_template, flash, redirect, session, g, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy.exc import IntegrityError
from forms import UserAddForm, LoginForm, EditUserForm, DeleteUserForm
from models import User, Game
from random import randint

from my_secrets import MY_SECRET_KEY, DB_NAME
from pkmn_list import pokemon_list
from game_functions import *

from models import db, connect_db

CURR_USER_KEY = "curr_user"
BASE_API_URL = "https://pokeapi.co/api/v2/"
COUNTER_LIMIT = 15
DEFAULT_PFP = '/static/images/pokeball.png'
# password set to: pokemonguesser
SANDBOX_USER = "PkmnGssr"

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

@app.route("/time-attack")
def altGameMode():
    """
    Hard mode of regular gameplay. Timer pauses during API calls
    Account required to play. Redirected to signup if not signed in
    """
    pkmn = pokemon_list
    if not g.user:
        flash("Unauthorized. Account required to play time-attack", "danger")
        return redirect("/signup")
    
    return render_template('game-2.html', pkmn=pkmn)


@app.route("/login", methods=['GET', 'POST'])
def login():
    """Handle a user attempting to log in"""
    if g.user:
        return redirect (f"/profile/{g.user.id}")
    
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
    if g.user:
        return redirect (f"/profile/{g.user.id}")

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

    if not g.user:
        flash("Access unauthorized.", "danger")
        return redirect("/")

    user = User.query.get_or_404(user_id)
    del_form = DeleteUserForm()
    edit_form=EditUserForm(obj=user)

    choices = [(idx, f"{idx} - {pkmn}") for (idx, pkmn) in enumerate(['None'] + pokemon_list[:])]
    edit_form.fav_pkmn.choices = choices
    
    user_stats = getProfileStats(g.user.id)
    
    if edit_form.validate_on_submit():
        print("edit valid")
        # Validate user
        user = User.authenticate(g.user.username, edit_form.password.data)
        if(user):
            if(edit_form.new_password.data):
                if(g.user.username != SANDBOX_USER):
                    User.update_pass(user, edit_form.new_password.data)
                else:
                    flash("Not allowed to update this user's password due to being for sandbox use.", "primary")
            if(edit_form.fav_pkmn.data != g.user.fav_pkmn):
                g.user.fav_pkmn = edit_form.fav_pkmn.data
                
                # Update image URL
                if(edit_form.fav_pkmn.data == 0):
                    g.user.img_url = DEFAULT_PFP
                else:
                    try:
                        resp = requests.get(f"{BASE_API_URL}/pokemon/{edit_form.fav_pkmn.data}")
                        img_data = resp.json()['sprites']['other']['official-artwork']
                        image_url = img_data['front_shiny'] if (randint(1, 512) == 512) else img_data['front_default']
                    except:
                        image_url = DEFAULT_PFP
                        flash("An error occursed with your favorite pokemon. Default image set.", "danger")
                    g.user.img_url = image_url
            
            try:
                g.user.email = edit_form.email.data
                db.session.commit()
            except IntegrityError as e:
                flash("E-mail already exists!", "danger")
                db.session.rollback()

    # Must be after edit_form validation or will not update
    junk, fav_pokemon = choices[g.user.fav_pkmn]
    
    return render_template('profile.html', del_form=del_form, edit_form=edit_form, fav_pokemon=fav_pokemon, user_stats=user_stats)

@app.route("/leaderboard")
def leaderboard():
    """Display leaderboards for all players"""
    top_scores_normal = Game.query.filter(Game.game_mode == 1).order_by(Game.score).limit(25).all()
    top_scores_time = Game.query.filter(Game.game_mode == 2).order_by(Game.score).limit(25).all()

    return render_template('leaderboard.html', top_scores_normal=top_scores_normal, top_scores_time=top_scores_time)

@app.route("/profile/delete", methods=["POST"])
def deleteAccount():
    '''Delete the user's profile & redirect them to the signup page afterwards. If unauthorized, simply redirect to "/"'''

    form = DeleteUserForm()

    if not g.user:
        flash("Access unauthorized.", "danger")
        return redirect("/")
    
    if form.validate_on_submit():
        user = User.authenticate(g.user.username, form.password.data)
        if(user):
            do_logout()

            if(g.user.username != SANDBOX_USER):
                db.session.delete(g.user)
                db.session.commit()
                flash("Account Deleted.", "info")
            else:
                flash(f"{SANDBOX_USER} not deleted due to being for sandbox use.", "primary")

            return redirect("/signup")
    return redirect(f"/profile/{g.user.id}")

# Routes for game to keep track of data on server through session, necessary for the game to work
# ////////////////////////////////////////////////////////////////
@app.route("/random-pokemon", methods=['POST'])
def setRandomPoke():
    """Generate a random pokemon & store it in the session through a dictionary object"""
    dex_num = randint(1, len(pokemon_list) - 1)
    session['poke'] = buildPokemon(dex_num)
    session['guess_counter'] = 0

    return "POKEMON GENERATED (server-side)"

@app.route("/compare-pokemon/<int:dex_num>", methods=['POST'])
def comparePoke(dex_num):
    """
    Compare player's guess to session['poke'] & return a dictionary of the result
    OK = data is the same across session and guess
    BAD = data is different across sessiong and guess
    """
    to_guess = buildPokemon(dex_num)
    result = {}
    for k in to_guess:
        if(k in ["Egg1", "Egg2"]):
            if(to_guess[k] in [session['poke']["Egg1"], session['poke']["Egg2"]] ):
                result[k] = [to_guess[k], "OK"]
            else:
                result[k] = [to_guess[k], "BAD"]

        elif(k in ["Type1", "Type2"]):
            if(to_guess[k] in [session['poke']["Type1"], session['poke']["Type2"]] ):
                result[k] = [to_guess[k], "OK"]
            else:
                result[k] = [to_guess[k], "BAD"]

        else:
            if(session['poke'][k] == to_guess[k]):
                result[k] = [to_guess[k], "OK"]
            else:
                result[k] = [to_guess[k], "BAD"]

    session['guess_counter'] += 1
    session['victory'] = True if(session['poke']["Name"] == to_guess["Name"]) else False

    return jsonify(result)

@app.route("/get-answer", methods=["GET"])
def getAnswer():
    '''Returns the session pokemon. Should be called @ end of game to display pokemon's name'''
    if(session['poke'] == None):
        return redirect("/")
    
    solution = session['poke']["Name"]

    # Clear the session pokemon as a precaution for cheaters
    session['poke'] = None

    return jsonify(solution)

@app.route("/guess-counter", methods=["GET"])
def getGuessCounter():
    """Return how many guesses have been made & the limit"""

    counter_resp = {
        "counter": session['guess_counter'],
        "limit": COUNTER_LIMIT
    }

    return jsonify(counter_resp)

@app.route('/submit-game/<int:mode>', methods=["POST"])
def submitScore(mode):
    if not g.user:
        return jsonify("Login to submit your score!")
    outcome = session['victory']
    score = session['guess_counter']
    # Penalize loss with +100 to score
    if outcome == False:
        score += 100
    newScore = Game(
        user_id = g.user.id,
        score = score,
        game_mode = mode,
        outcome = outcome
    )
    db.session.add(newScore)
    db.session.commit()
    
    return jsonify(f"Score of {score} submitted for {g.user.username}!")
