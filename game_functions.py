import requests
from flask import g
from models import Game
from pkmn_list import pokemon_list
BASE_API_URL = "https://pokeapi.co/api/v2/"

def buildPokemon(dex_num):
    """Builds a dictionary object with pokemon data"""
    resp_poke = requests.get(f"{BASE_API_URL}/pokemon/{dex_num}").json()
    resp_spec = requests.get(f"{BASE_API_URL}/pokemon-species/{dex_num}").json()

    # resp_poke
    img_url = resp_poke['sprites']['other']['official-artwork']['front_default']
    type1 = resp_poke['types'][0]["type"]["name"]
    type2 = "None" if(len(resp_poke['types']) == 1) else resp_poke["types"][1]["type"]["name"]
    
    # resp_spec
    gen = resp_spec['generation']['name'][11:]
    shape = resp_spec['shape']['name']
    egg1 = resp_spec["egg_groups"][0]["name"]
    egg2 = "None" if(len(resp_spec['egg_groups']) == 1) else resp_spec["egg_groups"][1]["name"]
    color = resp_spec['color']['name']

    # Cheat/reference for testing, prints to terminal for reference
    if(g.user):
        print(f"{g.user.username} - BUILT",pokemon_list[dex_num - 1])
    else:
        print(f"guest - BUILT",pokemon_list[dex_num - 1])

    return {
        "Name"  : pokemon_list[dex_num - 1].title(),
        "Image" : img_url,
        "Gen"   : gen.upper(),
        "Egg1"  : egg1.capitalize(),
        "Egg2"  : egg2.capitalize(),
        "Color" : color.capitalize(),
        "Shape" : shape.lower(),
        "Type1" : type1.capitalize(),
        "Type2" : type2.capitalize(),
    }

def getProfileStats(id):
    """Generate & return a dictionary object with player stats to display on profile"""
    all_games = Game.query.filter(Game.user_id == id)
    
    # No data to calculate with yet
    if(all_games.count() == 0):
        return {
            "game_count"    : 0,
            "win_count"     : 0,
            "loss_count"    : 0,
            "guess_count"   : 0,
            "best_score"    : 0,
        }

    games_played    = all_games.count()
    games_won       = all_games.filter(Game.outcome == True).count()
    games_lost      = games_played - games_won
    
    sum_guesses = 0
    for game in all_games:
        # Account for +100 score penalty if loss
        sum_guesses += (game.score - (games_lost * 100))
    game_best       = all_games.order_by(Game.score).first()

    return{
        "game_count"    : games_played,
        "win_count"     : games_won,
        "loss_count"    : games_lost,
        "guess_count"   : sum_guesses,
        "best_score"    : game_best.score,
    }
