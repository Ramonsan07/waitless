let map

let info = new google.maps.InfoWindow()

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

    map = new google.maps.Map(mainDiv, mapOptions);

    google.maps.event.addListenerOnce(map, "idle", configure);


})


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
        size: new google.maps.Size(100, 100),
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

            info.setContent(`<div class="card text-white bg-success mb-3" style="width: 18rem;">
                                <div class="card-header text-center">${marker.getTitle()}</div>
                                <div class="card-body">
                                    <h5 class="card-title">Historial de concurrencia últimas 6 actualizaciones</h5>
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
                                        size: new google.maps.Size(100, 100),
                                        origin: new google.maps.Point(0, 0),
                                        anchor: new google.maps.Point(0, 0),
                                        scaledSize: new google.maps.Size(30, 30)
                                    }

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
                            //cambiando el icon a un aberberia normal.
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
                            //pusheando la hora de la actualizacion mas teciente en el array que contiene la hora en el eje y.
                            let newTime = new Date()
                            time.push(`${newTime.getHours()}:${newTime.getMinutes()}`)
                            //eliminando el primer elemento del array osea la hora de la actualizacion mas antigua.
                            //se elimina solo cuado el grafico muestre mas de 6 puntos
                            // estos dos ifs son un poco redundantes porque se podrian convertir en uno solo, pero asi es mas explicativo.
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

