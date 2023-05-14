from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional


class UserAddForm(FlaskForm):
    """Form for adding users."""

    username = StringField('Username', validators=[DataRequired()])
    email = StringField('E-mail', validators=[DataRequired(), Email()])
    fav_pkmn = SelectField('Favorite Pokemon', coerce=int)
    password = PasswordField('Password', validators=[
        Length(min=6),
        EqualTo('confirm', message='Passwords must match')])
    confirm  = PasswordField('Repeat Password')


class LoginForm(FlaskForm):
    """Login form."""

    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[Length(min=6)])

class EditUserForm(FlaskForm):
    """Form for editing users."""

    email = StringField('E-mail', validators=[DataRequired(), Email()])
    fav_pkmn = SelectField('Favorite Pokemon', coerce=int)

    new_password = PasswordField('New Password', validators=[
        Length(min=6),
        EqualTo('confirm', message='New Passwords must match'),
        Optional()])
    confirm  = PasswordField('Repeat New Password',
                             validators=[Optional()])

    password = PasswordField('Current password', validators=[Length(min=6)])
