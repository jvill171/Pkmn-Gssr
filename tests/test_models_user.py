"""User model tests."""

import os
from unittest import TestCase
from my_secrets import TEST_DB_NAME

from models import db, User, Game

os.environ['DATABASE_URL'] =  TEST_DB_NAME

from app import app

db.create_all()

USER_DATA = {
    "username"  : "testuser1",
    "password"  : "HASHED_PASSWORD_1",
    "email"     : "one@test.com",
    "fav_pkmn"  : 1,
}

class UserModelTestCase(TestCase):

    def setUp(self):
        """Create test client, add sample data"""

        User.query.delete()

        self.client = app.test_client()

    def test_user_model(self):
        """Does basic model work?"""
        u = User(**USER_DATA)

        db.session.add(u)
        db.session.commit()

        # User should not have any entries in the pkmn_games table, no game has been played yet
        self.assertEqual(len(u.game), 0)

    def test_repr(self):
        """Does the repr method work properly?"""
        u = User(**USER_DATA)
        db.session.add(u)
        db.session.commit()

        rep = f"<User id={u.id}, username={u.username}, email={u.email}, fav_pkmn={u.fav_pkmn}>"


        self.assertEqual(str(u), rep)
        self.assertNotEqual(u, rep)

    def test_signup(self):
        """Does User.signup() successfully create a new user, given valid credentials"""

        t_email = "valid@test.com"
        t_username = "Valid_Test_User"
        t_password = "VALID_HASHED_PASS"
        t_fav_pkmn = 1

        u = User(
            email    = t_email,
            username = t_username,
            password = t_password,
            fav_pkmn = t_fav_pkmn,
        )

        db.session.add(u)
        db.session.commit()

        self.assertEqual(u, User.query.first())
        self.assertEqual(u.email, t_email)
        self.assertEqual(u.username, t_username)
        self.assertEqual(u.password, t_password)
        self.assertEqual(u.fav_pkmn, t_fav_pkmn)

    def test_signup_fail(self):
        """Does User.signup() fail to create a new user if any of the given information is invalid/missing"""

        g_email = "good@test.com"
        g_username = "good_test_username"
        g_password = "GOOD_HASHED_PASS"
        g_fav_pkmn = 10

        v_email = "valid@test.com"
        v_username = "validtest_username"
        v_password = "VALID_HASHED_PASS"
        v_fav_pkmn = 5

        # Valid user to check against unique-ness
        u0 = User(email=v_email,    username=v_username,    password= v_password,   fav_pkmn=v_fav_pkmn)
        db.session.add(u0)
        db.session.commit()
        # -------- BAD USERS --------
        # Missing 1 piece of data
        u1 = User(                  username=g_username,    password=g_password,    fav_pkmn=g_fav_pkmn)
        u2 = User(email=g_email,                            password=g_password,    fav_pkmn=g_fav_pkmn)
        u3 = User(email=g_email,    username=g_username,                            fav_pkmn=g_fav_pkmn)
        u4 = User(email=g_email,    username=g_username,    password=g_password                        )
        # 1 piece of data is None
        u5 = User(email=None,       username=g_username,    password=g_password,    fav_pkmn=g_fav_pkmn)
        u6 = User(email=g_email,    username=None,          password=g_password,    fav_pkmn=g_fav_pkmn)
        u7 = User(email=g_email,    username=g_username,    password=None,          fav_pkmn=g_fav_pkmn)
        u8 = User(email=g_email,    username=g_username,    password=g_password,    fav_pkmn=None      )  
        # Duplicate username - ERROR UNIQUENESS
        u9 = User(email=g_email,    username=v_username,    password= g_password,   fav_pkmn=g_fav_pkmn)
        # Duplicate email - ERROR UNIQUENESS
        u10 = User(email=v_email,    username=g_username,    password= g_password,   fav_pkmn=g_fav_pkmn)

        bad_users = [u1, u2, u3, u4, u5, u6, u7, u8, u9, u10]

        for u in bad_users:
            with self.assertRaises(ValueError):
                try:
                    db.session.add(u)
                    db.session.commit()
                except:
                    db.session.rollback()
                    # Raise ValueError (did not expect None for a given
                    # piece of data, expected string or int respectively)
                    raise ValueError
                # Should never gain more users beyond 1st valid user
            self.assertEqual(len(User.query.all()), 1)
    
    def test_user_update_pass_good_data(self):
        """Does password get updated using User.update_pass(), given valid data?"""
        with app.test_request_context():
            first_pwd = "FIRST_PASSWORD"
            second_pwd = "SECOND_PASSWORD"
            User.signup("testusername", "testemail@test.com", first_pwd, "", 30)

            user = User.query.first()

            # Authenticate user w/ first_pwd (valid BEFORE change)
            self.assertEqual(user, User.authenticate(user.username, first_pwd))
            self.assertNotEqual(user, User.authenticate(user.username, second_pwd))

            # Update password
            User.update_pass(user, second_pwd)
            # Authenticate user w/ second_pwd (valid AFTER change)
            self.assertNotEqual(user, User.authenticate(user.username, first_pwd))
            self.assertEqual(user, User.authenticate(user.username, second_pwd))

    def test_user_authenticate_good_data(self):
        """Does User.authenticate() return a valid user, if given valid data"""
        with app.test_request_context():
            # Use signup to get a hashed password
            User.signup("testusername", "testemail@test.com", "TEST_PASSWORD", "", 30)

            user = User.query.first()
            self.assertEqual(user, User.authenticate(user.username, "TEST_PASSWORD"))

    def test_user_authenticate_bad_user(self):
        """Does User.authenticate() fail to return a valid user, if given incorrect username"""
        with app.test_request_context():
            # Use signup to get a hashed password
            User.signup("testusername", "testemail@test.com", "TEST_PASSWORD", "", 30)

            self.assertFalse(User.authenticate("bad_username", "TEST_PASSWORD"))

    def test_user_authenticate_bad_pwd(self):
        """Does User.authenticate() fail to return a valid user, if given incorrect password"""
        with app.test_request_context():
            # Use signup to get a hashed password
            User.signup("testusername", "testemail@test.com", "TEST_PASSWORD", "", 30)

            user = User.query.first()
            self.assertFalse(User.authenticate(user.username, "BAD_PASSWORD"))
            