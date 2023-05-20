"""User model tests."""

import os
from unittest import TestCase
from my_secrets import TEST_DB_NAME

from models import db, User, Game

os.environ['DATABASE_URL'] =  TEST_DB_NAME

from app import app

db.create_all()

# Test users to have games
USER_DATA_1 = {
    "username"  : "testuser1",
    "password"  : "HASHED_PASSWORD_1",
    "email"     : "one@test.com",
    "fav_pkmn"  : 1,
}
USER_DATA_2 = {
    "username"  : "testuser2",
    "password"  : "HASHED_PASSWORD_2",
    "email"     : "two@test.com",
    "fav_pkmn"  : 2,
}
# Test game data
GAME_DATA_1 = {
    "user_id"   : "",
    "score"     : 4,
    "game_mode" : 1,
    "outcome"   : True,
}

GAME_DATA_2 = {
    "user_id"   : "",
    "score"     : 104,
    "game_mode" : 1,
    "outcome"   : False,
}

GAME_DATA_3 = {
    "user_id"   : "",
    "score"     : 5,
    "game_mode" : 2,
    "outcome"   : True,
}

GAME_DATA_4 = {
    "user_id"   : "",
    "score"     : 105,
    "game_mode" : 2,
    "outcome"   : False,
}

class GameModelTestCase(TestCase):

    def setUp(self):
        """Create test client, add sample data"""

        User.query.delete()
        Game.query.delete()
        
        u1 = User(**USER_DATA_1)
        u2 = User(**USER_DATA_2)
        db.session.add_all([u1, u2])
        db.session.commit()

        self.client = app.test_client()

    def test_game_model(self):
        """Does basic model work?"""
        users = User.query.all()

        in_g = GAME_DATA_1
        in_g["user_id"] =  users[0].id

        game = Game(**in_g)

        db.session.add(game)
        db.session.commit()

        # Only 1 game created
        self.assertEqual(len(Game.query.all()), 1)

    def test_repr(self):
        """Does the repr method work properly?"""
        
        users = User.query.all()

        in_g = GAME_DATA_1
        in_g["user_id"] =  users[0].id

        game = Game(**in_g)

        db.session.add(game)
        db.session.commit()

        rep = f"<Game id={game.id}, score={game.score}, game_mode={game.game_mode}, outcome={game.outcome}>"

        self.assertEqual(str(game), rep)
        self.assertNotEqual(game, rep)

    def test_add_multiple(self):
        """Can multiple users have multiple games, even with the same outcome"""
        
        users = User.query.all()
        
        # User1 has games with unique scores, shared with User2
        game_data_1 = GAME_DATA_1
        game_data_1["user_id"] = users[0].id
        game_data_2 = GAME_DATA_2
        game_data_2["user_id"] = users[0].id
        game_data_3 = GAME_DATA_3
        game_data_3["user_id"] = users[0].id
        game_data_4 = GAME_DATA_4
        game_data_4["user_id"] = users[0].id
        
        # User2 has games with exact same scores
        game_data_5 = GAME_DATA_1
        game_data_5["user_id"] = users[1].id
        game_data_6 = GAME_DATA_1
        game_data_6["user_id"] = users[1].id
        game_data_7 = GAME_DATA_3
        game_data_7["user_id"] = users[1].id
        game_data_8 = GAME_DATA_3
        game_data_8["user_id"] = users[1].id

        g1 = Game(**game_data_1)
        g2 = Game(**game_data_2)
        g3 = Game(**game_data_3)
        g4 = Game(**game_data_4)
        g5 = Game(**game_data_5)
        g6 = Game(**game_data_6)
        g7 = Game(**game_data_7)
        g8 = Game(**game_data_8)
        

        game_list = [g1, g2, g3, g4, g5, g6, g7, g8]

        db.session.add_all(game_list)
        db.session.commit()

        self.assertEqual(len(Game.query.all()), len(game_list))
        