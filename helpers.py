from flask import session, redirect, url_for
from functools import wraps

# esta funcion decoradora verifica que el usuario tenga su identificador de sesion en cookies.
def loged_in(f):

    @wraps(f)
    def check(*args, **kwargs):
        if not 'user_id' in session:
            return redirect(url_for('about'))
        return f(*args, **kwargs)
    return check

