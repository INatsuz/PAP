let map;

let markers = [];
let polylines = [];
let infoWindows = [];

function initMap() {
    const Map = google.maps.Map;
    const LatLng = google.maps.LatLng;
    const Marker = google.maps.Marker;
    const Point = google.maps.Point;
    const Geocoder = google.maps.Geocoder;
    const Polyline = google.maps.Polyline;
    const InfoWindow = google.maps.InfoWindow;

    map = new Map(document.getElementById('map'), {
        center: {lat: 37.1419696, lng: -8.017453799999998},
        zoom: 4,
        zoomControl: false
    });

    for (let i = 0; i < mobilities_json.length; i++) {

        //Declaring and initializing the markers to be drawn on the map
        let marker1;
        let marker2;

        marker1 = new Marker({
            map: map,
            position: new LatLng(mobilities_json[i].originLat, mobilities_json[i].originLng),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#5F3",
                fillOpacity: 1,
                labelOrigin: new Point(0, 2),
                strokeWeight: 0.4
            },
            label: ""/*{
                text: mobilities_json[i].origin,
            }*/,
            zIndex: 1,
            project: mobilities_json[i].project
        });
        let originPartnerWindow = new InfoWindow({
            content: "" +
                "<div class='p-2'>" +
                "<header class='row no-gutters'>" +
                "<div class='col'>" +
                `<h4 class='p-2 m-0'>${mobilities_json[i].originPartner}</h4>` +
                "</div>" +
                "</header>" +
                "<hr/>" +
                "<div class='row no-gutters'>" +
                "<article class='p-2 font-size-16px text-justify col-12'>" +
                `${mobilities_json[i].originPartnerDesc}` +
                "</article>" +
                "</div>" +
                "</div>"
        });

        marker2 = new google.maps.Marker({
            map: map,
            position: new LatLng(mobilities_json[i].targetLat, mobilities_json[i].targetLng),
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#F00",
                fillOpacity: 1,
                labelOrigin: new Point(0, 2),
                strokeWeight: 0.4
            },
            label: ""/*mobilities_json[i].target*/,
            zIndex: 1,
            project: mobilities_json[i].project
        });
        let targetPartnerWindow = new InfoWindow({
            content: "" +
                "<div class='p-2'>" +
                "<header class='row no-gutters'>" +
                "<div class='col'>" +
                `<h4 class='p-2 m-0'>${mobilities_json[i].targetPartner}</h4>` +
                "</div>" +
                "</header>" +
                "<hr/>" +
                "<div class='row no-gutters'>" +
                "<article class='p-2 font-size-16px text-justify col-12'>" +
                `${mobilities_json[i].targetPartnerDesc}` +
                "</article>" +
                "</div>" +
                "</div>"
        });
        infoWindows.push(originPartnerWindow);
        infoWindows.push(targetPartnerWindow);
        markers.push(marker1);
        markers.push(marker2);

        marker1.addListener('click', function () {
            for (let j = 0; j < infoWindows.length; j++) {
                if (infoWindows[j] !== originPartnerWindow) {
                    infoWindows[j].close();
                }
            }
            originPartnerWindow.open(map, marker1);
        });
        marker2.addListener('click', function () {
            for (let j = 0; j < infoWindows.length; j++) {
                if (infoWindows[j] !== targetPartnerWindow) {
                    infoWindows[j].close();
                }
            }
            targetPartnerWindow.open(map, marker2);
        });

        //Creating the polyline connecting the origin and the destination
        let polyline = new Polyline({
            path: [marker1.getPosition(), marker2.getPosition()],
            map: map,
            geodesic: true,
            strokeWeight: 3,
            strokeColor: "#BB1010",
            project: mobilities_json[i].project
        });

        //Creating the mobility info window with the information about which students teachers went on that trip
        let student_list = "";
        for (let j = 0; j < mobilities_students_json.length; j++) {
            if (mobilities_students_json[j].IDMobility === mobilities_json[i].ID) {
                student_list += `<li>${mobilities_students_json[j].student}</li>`;
            }
        }
        let teacher_list = "";
        for (let j = 0; j < mobilities_teachers_json.length; j++) {
            if (mobilities_teachers_json[j].IDMobility === mobilities_json[i].ID) {
                teacher_list += `<li>${mobilities_teachers_json[j].teacher}</li>`;
            }
        }
        if (student_list !== "" || teacher_list !== "") {
            let departureDate = new Date(mobilities_json[i].departureDate);
            let arrivalDate = new Date(mobilities_json[i].arrivalDate);
            let content = "" +
                "<div class='p-2'>" +
                "<header class='row no-gutters'>" +
                "<div class='col-md-auto d-flex'>" +
                `<img src='imgs/projects/${mobilities_json[i].IDProject}.png' height='75' alt='Logo' class='rounded mx-auto align-self-center'>` +
                "</div>" +
                "<div class='col-md d-flex'>" +
                `<h4 class='p-2 align-self-center w-100 text-center m-0'>${mobilities_json[i].project}</h4>` +
                "</div>" +
                "</header>" +
                `<p class='m-0 text-center'>${departureDate.getDate()}/${departureDate.getMonth() + 1}/${departureDate.getFullYear()} ↔ ${arrivalDate.getDate()}/${arrivalDate.getMonth() + 1}/${arrivalDate.getFullYear()}</p>` +
                "<hr/>" +
                "<article class='mt-2 font-size-16px row no-gutters'>" +
                "<div class='col-6 pr-1'>" +
                "<h5>Students</h5>" +
                "<ul class='pl-3'>" +
                `${student_list}` +
                "</ul>" +
                "</div>" +
                "<div class='col pl-1'>" +
                "<h5>Teachers</h5>" +
                "<ul class='pl-3'>" +
                `${teacher_list}` +
                "</ul>" +
                "</div>" +
                "</article>" +
                "</div>";
            let mobilityWindow = new InfoWindow({
                content: content
            });
            polyline.addListener("click", function (event) {
                console.log(event.latLng.lat() + ":" + event.latLng.lng());
                for(let i = 0; i < infoWindows.length; i++){
                    infoWindows[i].close();
                }
                mobilityWindow.setPosition(event.latLng);
                mobilityWindow.open(map);
            });
            infoWindows.push(mobilityWindow);
        }
        polylines.push(polyline);
    }
}

$(document).ready(function (event) {
    $(".project-btn").click(function (event) {
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].project !== $(this).data("project")) {
                markers[i].setVisible(false);
            } else {
                markers[i].setVisible(true);
            }
        }
        for (let i = 0; i < polylines.length; i++) {
            if (polylines[i].project !== $(this).data("project")) {
                polylines[i].setVisible(false);
            } else {
                polylines[i].setVisible(true);
            }
        }
    });
});