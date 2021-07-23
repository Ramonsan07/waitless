from flask import Flask, session, render_template, request, url_for, redirect, jsonify, flash
from markupsafe import escape
from helpers import loged_in
from werkzeug.security import check_password_hash, generate_password_hash
#entrando en conflicto 006

from cs50 import SQL
#esto se va
app = Flask(__name__)

db = SQL("sqlite:///waitless.db")


cookie_key = escape("b&#\\39;\\xd8c\\xb2C!.\\xbf\&#39;\\xfe[\\xd3 \\xb9\\x8b\\xe6\\x08K\\xde\\x068\\x98\\xfbO\\x05t\\x94R\\xbe\\x19&amp;V&#39;")
app.secret_key = cookie_key


@app.route('/about', methods=["GET"])
def about():
    session.clear()
    return render_template('about.html')



@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        session.clear()
        return render_template("login.html")
    elif request.method == "POST":
        user_name, password = request.form.get("username").lower(), request.form.get("password")

        lista = [user_name, password]

        if "" in lista:
            return "campos vacios", 400
        # TODO: hacer unique el user_name en la db.
        user = db.execute("SELECT * FROM USER WHERE user_name = :user_name", user_name=user_name)

        if len(user) != 1 or not check_password_hash(user[0]["user_password"], password):
            return "usuario o contraseña incorrectos", 400

        # darle cookie al user para recordarlo.
        session["user_id"] = user[0]["user_id"]

        return redirect(url_for("index"))

@app.route("/signin", methods=["GET", "POST"])
def signin():

    if request.method == "GET":
        session.clear()
        return render_template("signin.html")
    elif request.method == "POST":
        user_name, firstname, lastname, password, email, user_type = request.form.get("username"), request.form.get("firstname"), request.form.get("lastname"), request.form.get("password"), request.form.get("email"), request.form.get('user_type')
        lista = [user_name, firstname, lastname, password, email, user_type]

        if "" in lista:
            return "campos no validos", 400


        # buscando el tipo de usuario.
        type_id = db.execute("SELECT type_user_id FROM type_user WHERE type_user_name = :user_type", user_type=user_type)

        if (type_id[0].get("type_user_id") == None) or (type_id[0].get("type_user_id") == ""):
            return "Error: tipo de usuario incorrecto", 400

        try:

            new_user_id = db.execute("INSERT INTO user (user_name, user_lastname, user_first_name, user_password, email) values(:user_name, :firstname, :lastname, :password, :email)", user_name = user_name.lower(), firstname = firstname, lastname = lastname, password = generate_password_hash(password), email = email)

        except RuntimeError:
            return "este usuario ya existe", 400


        db.execute("INSERT INTO user_role (u_role_role, u_role_user) values(:role, :user)", role=type_id[0]["type_user_id"], user=new_user_id)

        session["user_id"] = new_user_id

        return redirect(url_for('index'))

@app.route('/')
@loged_in
def index():
    return render_template("index.html", key='AIzaSyAoXq9RX6z2YVaWBKbg9aiFlp_SDeBYZCI', user=True)

@app.route('/update')
@loged_in
def update():

    #latitudes y logitudes que describen la pantalla que esta viendo el usuario.
    ne_lat, ne_lng, sw_lat, sw_lng = request.args.get("nelat"), request.args.get("nelgn"), request.args.get("swlat"), request.args.get("swlgn")


    user_id = session['user_id']

    # TODO: hacerle un order by rating para que te salgan las barberias mas relevantes.
    # seleccionando todas las barberias en la vista del mapa que no son las favoritas del usuario.
    barbershops = db.execute("""SELECT p_barbershop_lat AS lat, p_barbershop_lng AS lng, p_barbershop_id AS id,
                             p_barbershop_name AS name
                             FROM place_barbershop LEFT JOIN favourite_place_barbershop
                             on (f_p_barbershop_place = p_barbershop_id)
                             WHERE p_barbershop_id NOT IN (SELECT p_barbershop_id
                                       FROM place_barbershop inner JOIN favourite_place_barbershop
                                       on (f_p_barbershop_place = p_barbershop_id)
                                       WHERE f_p_barbershop_user = :user_id
                                       AND p_barbershop_lat <= :ne_lat AND p_barbershop_lat >= :sw_lat
                                       AND p_barbershop_lng >= :sw_lng AND p_barbershop_lng <= :ne_lng)
                             AND p_barbershop_lat <= :ne_lat AND p_barbershop_lat >= :sw_lat
                             AND p_barbershop_lng >= :sw_lng AND p_barbershop_lng <= :ne_lng
                             LIMIT 200""",
                             user_id=user_id, ne_lat=ne_lat, ne_lng=ne_lng, sw_lat=sw_lat, sw_lng=sw_lng)

    # seleccionando todas las barberias favoritas en la vista del usuario.
    favourite_barbershops = db.execute("""SELECT p_barbershop_lat AS lat, p_barbershop_lng AS lng, p_barbershop_id AS id,
                                       p_barbershop_name AS name, f_p_barbershop AS f_id
                                       FROM place_barbershop inner JOIN favourite_place_barbershop
                                       on (f_p_barbershop_place = p_barbershop_id)
                                       WHERE f_p_barbershop_user = :user_id
                                       AND p_barbershop_lat <= :ne_lat AND p_barbershop_lat >= :sw_lat
                                       AND p_barbershop_lng >= :sw_lng AND p_barbershop_lng <= :ne_lng""",
                                       user_id=user_id, ne_lat=ne_lat, ne_lng=ne_lng, sw_lat=sw_lat, sw_lng=sw_lng)

    # union de los dos tipos de barberia con un campo mas en f_b para pintarlas diferentes
    return jsonify(barbershops + favourite_barbershops)


@app.route('/infobarbershop/<int:barbershop_id>', methods=["GET", "POST"])
@loged_in
def info_barbershop(barbershop_id):

    Barbershop_rating = db.execute("""SELECT avg(r_p_barbershop_rating) AS rating FROM rating_place_barbershop
                                   where r_p_barbershop_place = :barbershop""", barbershop=barbershop_id)

    # 6 ultimos registros de la concurrencia de una barberia.
    barbershop_concurrency_info = db.execute("""SELECT c_h_barbershop_concurrency AS concurrency,
                             c_h_barbershop_time AS date
                             FROM place_barbershop inner join concurrency_history_barbershop
                             ON (c_h_barbershop_place_barbershop = p_barbershop_id )
                             WHERE c_h_barbershop_place_barbershop = :barbershop_id
                             ORDER BY c_h_barbershop_time DESC LIMIT 6""", barbershop_id=barbershop_id)

    #direccion de la barberia.
    barbershop_direccion_info = db.execute("""SELECT p_barbershop_direccion AS direccion from place_barbershop
                                           WHERE p_barbershop_id = :barbershop_id""", barbershop_id = barbershop_id)

    # revisando que la barberia sea favorita del usuario. Esto es necesario por si pensas que no.
    is_liked = bool(db.execute("""SELECT f_p_barbershop FROM favourite_place_barbershop
                          WHERE f_p_barbershop_cod = :cod""", cod="{0}{1}".format(session["user_id"], barbershop_id)))

    # construyendo el objeto de respuesta.
    barbershop_info = {"concurrency": barbershop_concurrency_info,
                        "direccion": barbershop_direccion_info[0]["direccion"],
                        "is_liked": is_liked,
                        "rating": Barbershop_rating

                      }

    return jsonify(barbershop_info)

@app.route('/like/<int:barbershop_id>', methods=["DELETE", "POST"])
@loged_in
def like(barbershop_id):

    if request.method == "POST":
        # que pobresa ese SQL. Me doy pena. Ya se como hacerlo bien almenos.
        try:
            db.execute("""INSERT INTO favourite_place_barbershop (f_p_barbershop_user, f_p_barbershop_place, f_p_barbershop_cod)
                       VALUES(:user_id, :barbershop_id, :barbershop_cod)""", user_id=session["user_id"], barbershop_id=barbershop_id, barbershop_cod="{0}{1}".format(session["user_id"], barbershop_id))
        except:
            return "already liked"

        return "ok", 200

    if request.method == "DELETE":

        db.execute("""DELETE FROM favourite_place_barbershop
                   where f_p_barbershop_cod = :barbershop_cod""", barbershop_cod="{0}{1}".format(session["user_id"], barbershop_id))

        return "ok", 200


@app.route("/concurrency/<int:barbershop_id>", methods=["POST"])
@loged_in
def concurrency(barbershop_id):

    concurrency_value = request.form.get("concurrency")

    db.execute(""" INSERT INTO concurrency_history_barbershop(c_h_barbershop_place_barbershop, c_h_barbershop_user, c_h_barbershop_time, c_h_barbershop_concurrency)
               values(:barbershop_id, :user_id, julianday('now'), :concurrency)""", barbershop_id=barbershop_id, user_id=session["user_id"], concurrency=concurrency_value)

    return "ok", 200


@app.route("/ratingbarbershop/<int:barbershop_id>/<int:barbershop_rating>", methods=["POST"])
@loged_in
def ratingbarbershop(barbershop_id, barbershop_rating):
    if request.method == "POST":

        #tenes que ver el formato en el que va ese date now y el de sql lite para que la mierda sirva: Ya sirve la mierda.

        #Hay dos formas de insertar estos ratings en la base de datos: Un partial Unique index o chequias si existe el registro de ese usuario dandole rating a
        #esa barberia y lo actualizas, sino, obvio lo insertas. Ni idea cual es mas eficiente.
        #negativo. Lo que hay que hacer aqui es una composite key con los dos valores. r_p_barbershop_place, r_p_barbershop_user

        #buscando si ya le dio rating el usuario a la barberia.
        already_rated = db.execute("""select * from rating_place_barbershop
                                   where r_p_barbershop_user = :user AND r_p_barbershop_place = :barbershop"""
                                   , barbershop=barbershop_id, user=session["user_id"])
        #si ya le dio rating actualizar el valor del rating
        if  len(already_rated) == 1:
            db.execute("""UPDATE rating_place_barbershop set r_p_barbershop_rating=:rating 
                       where r_p_barbershop_user=:user AND r_p_barbershop_place=:barbershop"""
                       , rating=barbershop_rating, user=session["user_id"], barbershop=barbershop_id)
            return "ok", 200
        #si no le ha dado rating insertar el nuevo registro con el rating.
        else:
            db.execute("""INSERT INTO rating_place_barbershop
                       (r_p_barbershop_place, r_p_barbershop_user, r_p_barbershop_rating, r_p_barbershop_time)
                       values(:barbershop, :user, :rating, julianday('now')) """, barbershop=barbershop_id, user=session["user_id"], rating=barbershop_rating)

        return "ok", 200

app.run(ssl_context='adhoc')
