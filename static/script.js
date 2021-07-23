let map

// ESTO DE AQUI HAY QUE HACERLO RESPONSIVE.
//anchura de la ventana, altura de la ventana. window width, window height.
let ww = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
let wh = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

//si el ancho de ventana es mayor que la altura el info window ocupa un tercio del ancho de la pantalla, sino la ocupa toda.
let infolen = ww > wh ? ww/3 : ww

//intancia de infowindow dimeniones especificas configuradas.
let info = new google.maps.InfoWindow({ maxWidth: infolen, minWidth: infolen })

markers = []

document.addEventListener('DOMContentLoaded', () => {

    var mainDiv = document.getElementById('map')


    // estilos para el mapa.
    var mapStyles = [
        {
            featureType: "road",
            elementType: "geometry",
            "stylers": [
                { "color": "#00cc00" }
            ]

        },

        {
            featureType: "landscape",
            stylers:[
                { visibility: "off"  }
            ]
        },


        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        },
        {
            featureType: "poi",
            elementType: "labels.text",
            stylers: [
                { visibility: "on" }
            ]
        },



    ]

    // objeto constructor del mapa.
    var mapOptions = {
        zoom: 15,
        center: { lat: 11.8482604, lng: -86.4393446 },
        disableDefaultUI: true,
        zoomControl: true,
        styles: mapStyles
    };

    // creando y configurando el mapa.
    map = new google.maps.Map(mainDiv, mapOptions);


    //este evento se dispara solo una vez y lo hace cuando el mapa se termina de instanciar. (creo xd)
    google.maps.event.addListenerOnce(map, "idle", configure);


})

// esto esta requetemal optimizado pero ya se como componerlo (creo x2)
function configure() {
    google.maps.event.addLister

    google.maps.event.addListener(map, "dragend", function() {

        // If info window isn't open
        // http://stackoverflow.com/a/12410385
        if (!info.getMap || !info.getMap()) {
            update();
        }
    });

    google.maps.event.addListener(map, "zoom_changed", function() {
        if (!info.getMap || !info.getMap()) {
            update();
        }
    });

    google.maps.event.addListener(map, "click", () => {
        if (info.getMap()  || info.getMap){
            info.close()
        }
    })

    // creando un Custom Control. ver: https://developers.google.com/maps/documentation/javascript/controls#ControlPositioning
    let controlDiv = document.createElement("div")
    controlDiv.innerHTML = `<button><img src="https://img.icons8.com/color/48/000000/gps-device.png"/></button>`
    controlDiv.style.margin = "1em"
    controlDiv.index = 1

    //custom image del marker para la geolocalizacion.
    var geolocationImage = {
        url: `https://earth.google.com/images/kml-icons/track-directional/track-none.png`,
        size: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 0),
        scaledSize: new google.maps.Size(40, 40)
    }

    // instancia del marcador que representa la ubicacion del usuario.
    var geolocationMarker = new google.maps.Marker({
        position: new google.maps.LatLng(0, 0),
        map: map,
        title: 'your Location',
        icon: geolocationImage
    });
    // Evento click del button localizacion
    controlDiv.addEventListener("click", ()=>{
        if (navigator.geolocation){

            // orservando la ubicacion del usuario.
            navigator.geolocation.watchPosition((pos)=>{


                // actualizando el marcador que representa la geolocalizacion del usuario.
                geolocationMarker.setPosition(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude))

            },
            ()=>{
                console.log("error al activar localizacion.")
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0
            })
        } else {
            alert("no se puede usar la geolocalizacion")
        }
    })

    // agregando un custom control a la interfaz de usuarios de google maps.
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv)

    update()
}

function removeMarkers() {
    //Quitando del mapa los marcadores viejos.
    markers.forEach((marker) => {
        marker.setMap(null)
    })
    //Eliminando todas las referencias del arreglo.
    markers.length = 0
}


function addMarker(marker_place) {

    // verificando si la barberia es favorita del usuario o no.
    var url = marker_place['f_id'] == undefined? "https://img.icons8.com/ios-filled/50/000000/barbershop.png" : "https://img.icons8.com/cotton/64/000000/like--v3.png"

    var image = {
        url: url,
        size: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 0),
        scaledSize: new google.maps.Size(30, 30)
    }

    // instancia del marcador a colocar.
    let marker = new google.maps.Marker({
        position: { lat: marker_place.lat, lng: marker_place.lng },
        map: map,
        title: marker_place.name,
        icon: image

    });

    // evento click para mostrar informacion sobre la barberia.
    marker.addListener('click', ()=>{
        fetch(`/infobarbershop/${marker_place.id}`, {
            method: 'get',
            mode: 'same-origin'
        }).then((res) => {

            return res.json()

        }).then((res) => {
            //hay una manera mucho mas elegante de escribir esto sin el setTimeout pero ya lo hice asi mmmm.
            likeButtonColorClass = res.is_liked ? "btn-danger" : "btn-light"

            console.log(res)

            info.setContent(`<div id="infowindow_card" class="card text-white bg-success mb-3">
                                <div class="card-header text-center">${marker.getTitle()}</div>

                                <div class="card-body">

                                    <div class="rate" id = "starRaterBarbershop">
                                        <input class = "iStar" type="radio" id="star5" name="rate" value="5" />
                                        <label for="star5" title="text">5 stars</label>
                                        <input class = "iStar" type="radio" id="star4" name="rate" value="4" />
                                        <label for="star4" title="text">4 stars</label>
                                        <input class = "iStar" type="radio" id="star3" name="rate" value="3" />
                                        <label for="star3" title="text">3 stars</label>
                                        <input class = "iStar" type="radio" id="star2" name="rate" value="2" />
                                        <label for="star2" title="text">2 stars</label>
                                        <input class = "iStar" type="radio" id="star1" name="rate" value="1" />
                                        <label for="star1" title="text">1 star</label>
                                    </div>
                                    <P id="barbershop_rating" class="card-text mr-auto pr-auto mb-auto d-block">${res.rating[0].rating? res.rating[0].rating:`<p class="text-nowrap bd-highlight">No ratings</p>`}</p>

                                    

                                    <h5 class="card-title ">Historial de concurrencia últimas 6 actualizaciones</h5>
                                    <div class="bg-light mb-2 px-auto">
                                    <canvas id="myChart" width="100" height=80></canvas>
                                    </div>

                                    <button id="btn-like" type="button" class="btn ${likeButtonColorClass} btn-sm"><img class=${likeButtonColorClass} src="https://img.icons8.com/cotton/64/000000/like--v3.png"/></button>


                                    <select name="consurrency" id="selectConcurrency" class="custom-select custom-select-lg mt-1">
                                        <option selected>Actualizar</option>
                                        <option value="0">0: Vacía</option>
                                        <option value="1">1: Muy pocas personas (1 persona por barbero)</option>
                                        <option value="2">2: Algunas personas (de 2 a 3 personas por barbero)</option>
                                        <option value="3">3: muchas personas (de 4 a 5 personas por barbero)</option>
                                        <option value="4">4: No vengan (mas de 6 personas por barbero)</option>

                                    </select>

                                    <button id="btnSaveConcurrency" class="btn btn-light btn-outline-info d-none mt-2">confirmar actualizacion</button>




                                    <p class="card-text mt-2">Direccion: ${res.direccion}</p>
                            </div>`)
            setTimeout(() => {

                let data = []
                let time = []
                // creando un array con la con currencia a lo largo del tiempo de la barberia.
                res.concurrency.forEach((val)=>{
                    data.push(val.concurrency)
                    let hour = new Date((val.date * 24 * 60 * 60 * 1000) + (1000 * 60 * 60 * 12) )
                    time.push(`${hour.getHours()}: ${hour.getMinutes()}`)
                })


                //creado un chart y configurandolo con la informacion de la barberia seleccionada.
                var ctx = document.getElementById('myChart');
                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: time.reverse(),
                        datasets: [{
                            label: 'concurrencia',
                            data: data.reverse(),
                            backgroundColor:
                                'rgba(0, 99, 132, 0.2)',

                            borderColor:
                                'rgba(0, 255, 255, 1)',


                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    max: 4,
                                    precision: 0
                                }
                            }]
                        },

                        events: null
                    }
                });
                    //evento para hacer la barberia clickeada favorita.
                btnLike = document.getElementById("btn-like")
                btnLike.addEventListener("click", ()=>{

                    //con cada click cambia de color.
                    if (btnLike.classList.contains("btn-light")){

                        //catcha
                        btnLike.classList.remove("btn-light")
                        btnLike.childNodes[0].classList.remove("btn-light")
                        btnLike.classList.add("btn-danger")
                        btnLike.childNodes[0].classList.add("btn-danger")

                        fetch(`like/${marker_place.id}`,
                        {
                            method:"POST",
                            mode: "same-origin"
                        }).then((res)=>{

                            return res.text()

                        }).then((res) => {

                            if (res == "ok"){
                            //cambiando el icon al de una barberia favorita.
                            let heartNewImage = {
                                        url: "https://img.icons8.com/cotton/64/000000/like--v3.png",
                                        size: new google.maps.Size(30, 30),
                                        origin: new google.maps.Point(0, 0),
                                        anchor: new google.maps.Point(0, 0),
                                        scaledSize: new google.maps.Size(30, 30)
                                    }
                            marker.setIcon(null)
                            marker.setIcon(heartNewImage)
                            } else if (res != "already liked"){

                                console.log("fetch_error: like")

                            }
                        })

                    } else {

                        btnLike.classList.remove("btn-danger")
                        btnLike.classList.add("btn-light")
                        btnLike.childNodes[0].classList.remove("btn-danger")
                        btnLike.childNodes[0].classList.add("btn-light")

                        fetch(`like/${marker_place.id}`,
                        {
                            method: "DELETE",
                            mode: "same-origin"
                        }).then((res)=>{

                            return res.text()

                        }).then((res)=>{
                            if (res == "ok"){
                            //cambiando el icon a una berberia normal.
                            let barbershopNewImage = {
                                        url: "https://img.icons8.com/ios-filled/50/000000/barbershop.png",
                                        size: new google.maps.Size(100, 100),
                                        origin: new google.maps.Point(0, 0),
                                        anchor: new google.maps.Point(0, 0),
                                        scaledSize: new google.maps.Size(30, 30)
                                    }

                            marker.setIcon(barbershopNewImage)
                            } else{
                                console.log("fetch_error: dislike")
                            }
                        })

                    }
                })

                let update_concurrency = document.getElementById("selectConcurrency")
                let btnSaveCuncurrency = document.getElementById("btnSaveConcurrency")

                update_concurrency.addEventListener("change", ()=>{
                    let option = update_concurrency.options[update_concurrency.selectedIndex]


                    if (option.innerHTML != "Actualizar"){

                        btnSaveCuncurrency.classList.remove("d-none")
                        btnSaveCuncurrency.classList.add("d-block")

                    } else{

                        btnSaveCuncurrency.classList.add("d-none")
                        btnSaveCuncurrency.classList.remove("d-block")

                    }

                })

                //cuando se clikea esta boton se actualiza la concurrencia de la barberia.
                btnSaveConcurrency.addEventListener("click", ()=>{
                    //formdata para enviar por post.
                    let formData = new FormData()
                    formData.append("concurrency", update_concurrency.options[update_concurrency.selectedIndex].value)
                    fetch(`concurrency/${marker_place.id}`, {
                        method: "POST",
                        body: formData
                    }).then((res)=>{

                        if (res.status == 200){

                            //actualizando el chart con el nuevo punto
                            //pusheando la actualizacion mas reciente en el array que usa el dataset de chart.
                            data.push(Number(update_concurrency.options[update_concurrency.selectedIndex].value))
                            //eliminando el primer elemento del array osea la actualizacion mas antigua.
                            //se elimina solo cuado el grafico muestre mas de 6 puntos
                            if (data.length > 6){
                                data.shift()
                            }
                            //pusheando la hora de la actualizacion mas reciente en el array que contiene la hora en el eje y.
                            let newTime = new Date()
                            time.push(`${newTime.getHours()}:${newTime.getMinutes()}`)
                            //eliminando el primer elemento del array osea la hora de la actualizacion mas antigua.
                            //se elimina solo cuado el grafico muestre mas de 6 puntos
                            //estos dos if son un poco redundantes porque se podrian convertir en uno solo, pero asi es mas explicativo. Lo converti en 1
                            if (time.length > 6){
                                time.shift()
                            }
                            //actualizando el chart con los nuevos datos de la actualizacion.
                            myChart.data.datasets[0].data = data
                            myChart.data.labels = time
                            myChart.update()
                        }
                    })
                })
                //Div que contiene las stars.
                let starRater = document.getElementById("starRaterBarbershop")
                // I don't know what is going on hehe.
                // esto esta bien chapusero pero bueno es lo que hay hehe
                starRater.addEventListener("click", (e)=>{
                    //este evento se esta disparando dos veces porque hay un default behaviour en el input que la esta cangando y no se como
                    //componerlo porque el codigo que lo genera es css y yo de eso no mucho.
                    //y funciona porque el elemento que este repetido no tiene la propiedad value y devuelve undefined.
                    let starValue = (e.target.value)


                    // esto es lo mas chapusero que mi mente, hasta el dia de hoy, ha podido engendrar.
                    if (starValue === undefined) return

                    fetch(`ratingbarbershop/${marker_place.id}/${starValue}`, {
                        method: "POST",
                        mode: "same-origin"
                    }).then((res)=>{
                        console.log(res)

                    })
                    .catch(((err)=>{
                        console.log(err)
                    }))



                })




            },1)

            //abriendo el infowindow con todo el html de arriba.
            info.open(map, marker)

        })
    })

    //guardando referencia para despues eliminarlo.
    markers.push(marker)

}


function update() {
    // Get map's bounds
    let bounds = map.getBounds();
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();

    fetch(`/update?nelat=${ne.lat()}&nelgn=${ne.lng()}&swlat=${sw.lat()}&swlgn=${sw.lng()}`, {
        mode: 'same-origin',
        method: 'get'
    }).then((res) => {

        return res.json()

    }).then((res) => {

        removeMarkers()

        res.forEach(barbershop=>{
            addMarker(barbershop)
        })

    })

};
