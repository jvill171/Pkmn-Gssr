from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, IntegerField
from wtforms.validators import DataRequired, Email, Length, NumberRange, EqualTo


class UserAddForm(FlaskForm):
    """Form for adding users."""

    username = StringField('Username', validators=[DataRequired()])
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    fav_pkmn = IntegerField('Favorite Pokemon (Dex#)')
    password = PasswordField('Password', validators=[
        Length(min=6),
        EqualTo('confirm', message='Passwords must match')])
    confirm  = PasswordField('Repeat Password')


class LoginForm(FlaskForm):
    """Login form."""

    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[Length(min=6)])
