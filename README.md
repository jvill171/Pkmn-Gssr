# PkmnGssr
Live project deployed [here](https://pkmn-gssr.onrender.com/)

## API used
![Image of PokeAPI Logo](https://pokeapi.co/static/pokeapi_256.3fa72200.png)

The API used for this project is: [PokeAPI v2](https://pokeapi.co/docs/v2)

## What does the website do?
This website is meant to be a game where you must guess a randomly selected pokemon. As you progress with your guesses, you will be given clues to help deduce which pokemon was randomly selected.
These clues come in the following form:
- Pokeon Generation
- Pokemon Type
- Pokemon Shape
- Pokemon Color
- Pokemon Egg Group

The Reference area of the game will contain all the clues you have uncovered up to that point. If a specific attribute of a pokemon is shared between the pokemon you are trying to guess and the pokemon you have guessed, the icon will be given a green border. If it is not shared, it will be given a red border and made slightly transparent.

There are 2 game modes available to the player:
1. <u>**Regular Game**</u> - Login NOT required. 15 guesses with unlimited time between guesses.
2. <u>**Time-Attack Game**</u>  - Login required. 15 guesses with a 3 minute time limit between guesses. Timer pauses while the guess is being submitted  & validated.

Swapping between game modes is possible through the NavBar when logged in.

When signing up to play the game, your username & email must both be unique to any other player who has already signed up. For those who are hesitant to sign up, a user has been created for you to test the app with. A note with the login information has been placed in both the Log In and Sign Up pages.

This user has the following login credentials:  
<u>Username</u>: PkmnGssr  
<u>Password</u>: pokemonguesser

## Features
- <u>**Signup/Login**</u> - A user can sign-up or log-in. This is required to access the time-attack game mode.

- <u>**Time-Attack mode**</u> - This game mode is for players who want a challenge. 3 minutes is all the time the player has to guess the randomly selected pokemon.

- <u>**Leaderboard**</u> - A leaderbaord system has been implemented and will show up to the top 25 scores for each game mode. The lower your score, the better. 

- <u>**Profile**</u> - A user can update their email, password, or favorite pokemon. Knowing their current password is required to do so. Additionally, a user can delete their own account, which does not require a password or any verification.

## User Flow
Starting on the home route `/`, a user can play the game once the page has loaded. The user can submit a guess as to what pokemon has been selected in the input and begin to deduce the answer based on the clues given through the *Reference* section of the game's page. Should the game end or the player want to start a new game, they may press the New Game button at the top of the page and wait for a new pokemon to be selected. If the user is logged in, their score will be submitted. If the user is not logged in however, the score will not be submitted and the user will be informed to log in to have their score submitted.

On the `/leaderboard` page, they player can view the list of the top 25 scores players have gotten.

If the user has not created an account, they may do so on the `/signup` page. The Favorite Pokemon they user selects is used to change the profile picture of the user.

Once signed up or logged in, the user will be redireced to the `/` home page. Additionally, the user will now have access to two new pages. The first page they will have access to is the `/time-attack` page, where a more difficult, timed, version of the game is located. The second page they will have access to is their profile, accessible by clicking on their profile picture on the top-right.

Within the logged-in user's profile, the user will have access to their game-stats, a form to delete their account, and another form to update their account information, including their email, favorite pokemon, and password. Just as before, updating their favorite pokemon will give the user a new profile picture.

If the user chooses to delete their account, they will be redirected to the `/signup` page upon successful deletion.

## API notes & limitations
Both the client and server make API calls to PokeAPI to generate the reference data (client) & validate the player's guesses (server). 

When the game loads, the client makes API calls through the `game-icons.js` script to retrieve a list of Types, Shapes, Colors, and Egg Groups. Due to issues with incomplete data within the API, the decision to have a list of generations locally within this file was made. This is to exclude Generation 9+.
Similarly, to prevent excessive API calls, a list of all pokemon types is held locally in the `pkmn_list.py` file. Both the Generations list and Pokemon list would have to be manually updated in order to have an up-to-date list of pokemon to guess from as newer generations of pokemon are added to the API.

## If I had more time
- I would implement a filter that allows you to choose which generation(s) to exclude when a pokemon is being randomly selected. This would be helpful to players who are not familiar with specific or newer generations of pokemon.

- I would add more tests to my app, specifically for the views. Unittests for the models were created, but no tests were created for the views.

## Tech Stack
- <u>Front-End (client)</u> -  
  - HTML
  - CSS
  - Javascript
  - Jquery
  - AJAX
  - Bootstrap
  - Font-Awesome
- <u>Back-End (server)</u> - 
  - Python
  - Flask
  - Flask-WTF
  - Flask-Bcrypt
  - Flask-SQLAlchemy
  - Jinja2
- <u>Database</u>  
  - PostgreSQL
- <u>Deployment and Hosting</u>  
  - [Render](https://render.com/) (Cloud-based app hosting service)
  - [ElephantSQL](https://www.elephantsql.com/) (Cloud-based PostgreSQL database)

## Important notes
For anyone looking to clone this project, it is important to note that a `my_secrets.py` file is required.
The file's contents should look like this:

```python
MY_SECRET_KEY = 'YOUR_SECRET_KEY'
DB_NAME       = 'YOUR_DB_NAME'
TEST_DB_NAME  = 'YOUR_TEST_DB_NAME'
```