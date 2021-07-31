const openWeatherApiKey = "336ee374d3adce93770987a7cc399904";
const defaultSearchHistory = [];

//Get searchHistory from localStorage
function getSearchHistory() {
    var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || defaultSearchHistory;
    // var searchHistory = defaultSearchHistory;
    return searchHistory;
}

//Set setHistory to localStorage
function setSearchHistory(searchHistory) {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

async function weatherDashboardInit() {

    //Current Weather Test
    var weatherReport = await searchWeatherReport("Olathe,KS,USA");
    // console.log("weatherDashboardInit", weatherReport);

    renderWeatherReport(weatherReport);

}

function renderWeatherReport(weatherReport) {
    // console.log("renderWeatherReport", weatherReport.current, weatherReport.fiveDay);
    renderCurrent(weatherReport.current);
    renderFiveDay(weatherReport.fiveDay);
}

function renderCurrent(weatherObj) {
    console.log("renderCurrent", weatherObj);

    $("#cityName").html(weatherObj.name);
    $("#todayDate").html(weatherObj.date);
    $("#todayTemp").html(weatherObj.temp);
    $("#todayWind").html(weatherObj.windspeed);
    $("#todayHumidity").html(weatherObj.humidity);
    $("#todayUv").html(weatherObj.uvindex);

}

function renderFiveDay(weatherObjArr) {
    $(weatherObjArr).each(function(i, el) {
        var fiveDayId = "#five-day-" + i;
        $(fiveDayId).find(".five-day-date").html(el.date);
        $(fiveDayId).find(".five-day-icon").html(el.icon);
        $(fiveDayId).find(".five-day-temp").html(el.temp);
        $(fiveDayId).find(".five-day-wind").html(el.windspeed);
        $(fiveDayId).find(".five-day-humidity").html(el.humidity);
    });
}

async function searchWeatherReport(locale) {
    var geoData = await getGeoData(locale);
    
    // Add geoData to searchHistory array
    addGeoDataToSearchHistory(geoData);

    // Get weatherReport
    var weatherReport = await getWeatherReport(geoData);
    return weatherReport;
}

function addGeoDataToSearchHistory(geoData) {
    var searchHistory = getSearchHistory();

    if (searchHistory.find(x => x.lat == geoData.lat && x.lon == geoData.lon)) {
        //Do Nothing
    } else {
        searchHistory.push(geoData);
        setSearchHistory(searchHistory);
    }
}

function getGeoData(locale) {
    var fetchURL = "http://api.openweathermap.org/geo/1.0/direct?q=" + locale + "&limit=1&appid=" + openWeatherApiKey;
    var fetchData = fetch(fetchURL)
    .then(response => response.json())
    .then(function(data){
        var geoData = {
            name: data[0].name,
            lat: data[0].lat,
            lon: data[0].lon
        }
        return geoData;
    })

    return fetchData;
}

function getWeatherReport(geoData) {
    var fetchUrl = "https://api.openweathermap.org/data/2.5/onecall?&lat=" + geoData.lat + "&lon=" + geoData.lon + "&appid=" + openWeatherApiKey;
    var fetchData = fetch(fetchUrl)
    .then(response => response.json())
    .then(function(data){

        var cityWeatherObj = {
            current: parseWeatherObj(geoData.name, data.current),
            fiveDay: [
                parseWeatherObj(geoData.name, data.daily[0]),
                parseWeatherObj(geoData.name, data.daily[1]),
                parseWeatherObj(geoData.name, data.daily[2]),
                parseWeatherObj(geoData.name, data.daily[3]),
                parseWeatherObj(geoData.name, data.daily[4])
            ]
        };

        return cityWeatherObj;
    });
    return fetchData;
}

function parseWeatherObj(cityName, weatherObj) {
    var parsedWeatherObj = {
        name: cityName,
        date: weatherObj.dt,
        temp: weatherObj.temp,
        humidity: weatherObj.humidity,
        windspeed: weatherObj.wind_speed,
        uvindex: weatherObj.uvi,
        icon: weatherObj.weather[0].icon,
        desc: weatherObj.weather[0].desc
    };
    return parsedWeatherObj;
}


weatherDashboardInit();

