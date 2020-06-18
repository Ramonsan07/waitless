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


function configure(){
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


function addMarker(marker_place){

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
            likeButtonColorClass = marker_place['f_id'] == undefined? "btn-light" : "btn-danger"

            info.setContent(`<div class="card text-white bg-success mb-3" style="width: 18rem;">
                                <div class="card-header text-center">${marker.getTitle()}</div>
                                <div class="card-body">
                                    <h5 class="card-title">Historial de concurrencia últimas 3 actualizaciones</h5>
                                    <canvas id="myChart" width="100" height=80></canvas>
                                    <p class="card-text">${res.direccion}</p>
                                    <button id="btn-like" type="button" class="btn ${likeButtonColorClass} btn-sm"><img class=${likeButtonColorClass} src="https://img.icons8.com/cotton/64/000000/like--v3.png"/></button>

                            </div>`)
            setTimeout(()=>{

                //creado un chart y configurandolo con la informacion de la barberia seleccionada.
                var ctx = document.getElementById('myChart');
                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                        datasets: [{
                            data: [res.concurrency[0].concurrency, res.concurrency[1].concurrency, res.concurrency[2].concurrency],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
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

                        }).then((res)=>{

                            if (res == "ok"){
                            //cambiando el icon al de una barberia favorita.
                            newImage = {
                                        url: "https://img.icons8.com/cotton/64/000000/like--v3.png",
                                        size: new google.maps.Size(100, 100),
                                        origin: new google.maps.Point(0, 0),
                                        anchor: new google.maps.Point(0, 0),
                                        scaledSize: new google.maps.Size(30, 30)
                                    }

                            marker.setIcon(newImage)
                            } else if (text != "already liked"){

                                console.log("fetch_error: like")

                            }
                        })

                    } else{

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
                            newImage = {
                                        url: "https://img.icons8.com/ios-filled/50/000000/barbershop.png",
                                        size: new google.maps.Size(100, 100),
                                        origin: new google.maps.Point(0, 0),
                                        anchor: new google.maps.Point(0, 0),
                                        scaledSize: new google.maps.Size(30, 30)
                                    }

                            marker.setIcon(newImage)
                            } else{
                                console.log("fetch_error: dislike")
                            }
                        })

                    }
                })

            },1)

            //abriendo el infowindow con toda la informacion de la barberia.
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



