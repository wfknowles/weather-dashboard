const openWeatherApiKey = "336ee374d3adce93770987a7cc399904";
const baseUrl = "https://api.openweathermap.org/data/2.5/";

async function weatherDashboardInit() {

    //Current Weather Test
    var geoCode = getGeoCode("Olathe,KS,USA");

}

function getWeatherByZipCode(zip_code) {

}

function getGeoCode(locale) {
    var apiName = "direct?";
    var queryString = apiName + 'q=' + locale + '&limit=1' + '&appid=' + openWeatherApiKey;

    var apiURL = "http://api.openweathermap.org/geo/1.0/" + queryString;

    var fetchData = fetch(apiURL)
    .then(response => response.json())
    .then(function(data){

        var name = data[0].name;
        var lat = data[0].lat;
        var lon = data[0].lon;

        var oneCallUrl = baseUrl + "onecall?&lat=" + lat + "&lon=" + lon + "&appid=" + openWeatherApiKey;
        var oneCall = fetch(oneCallUrl)
        .then(response => response.json())
        .then(function(data){
            // return data;
            console.log("onecall", data);
            console.log("current weather", data.current);
            console.log("locality", name);
        });
    });
}


function getCurrentWeatherByZipCode(zip_code) {
    var apiName = "weather?"
    var queryString = apiName + 'zip=' + zip_code + '&appid=' + openWeatherApiKey;

    var fetchData = fetch(baseUrl + queryString)
    .then(response => response.json())
    .then(function(data){
        return data;
    });

    return fetchData;
}

// function apiTest1() {
//     var openWeatherApiKey = "336ee374d3adce93770987a7cc399904";
//     var baseUrl = "https://api.openweathermap.org/data/2.5/onecall?";
//     var latitude = "";
//     var longitude = "";
//     var exclude = "";
//     var queryString = "&lat=" + latitude + "&lon=" + longitude + "&exclude=" + exclude + "&appid=" + openWeatherApiKey;

//     fetch(baseUrl + queryString)
//     .then(response => response.json())
//     .then(function(data){
//         console.log(data);
//     });
// }

// function apiTest2() {
//     var openWeatherApiKey = "336ee374d3adce93770987a7cc399904";
//     var baseUrl = "https://api.openweathermap.org/data/2.5/";
//     var apiName = "weather?";
//     var city = "olathe";
//     var state = "ks";
//     var queryString = apiName + "q=" + city + "," + state + "&appid=" + openWeatherApiKey;

//     console.log(queryString);
//     fetch(baseUrl + queryString)
//     .then(response => response.json())
//     .then(function(data){
//         console.log(data);
//     });
// }

// function apiTest3() {
    
//     var apiName = "weather?";
//     var zipCode = "66061";
//     var queryString = apiName + 'zip=' + zipCode + '&appid=' + openWeatherApiKey;

//     console.log(queryString);
//     fetch(baseUrl + queryString)
//     .then(response => response.json())
//     .then(function(data){
//         console.log(data);
//     });
// }

weatherDashboardInit();
// apiTest2();
// apiTest3();
