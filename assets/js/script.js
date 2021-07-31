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
    renderCurrent(weatherReport.current);
    renderFiveDay(weatherReport.fiveDay);
}

function renderCurrent(weatherObj) {
    var status = getUvIndexStatus(weatherObj.uvindex);
    $("#current-city").html(weatherObj.name);
    $("#current-date").html(weatherObj.date);
    $("#current-icon").attr("src", "http://openweathermap.org/img/wn/"+weatherObj.icon+"@2x.png");
    $("#current-temp").html(parseKelvinToFahrenheit(weatherObj.temp));
    $("#current-wind").html(weatherObj.windspeed);
    $("#current-humidity").html(weatherObj.humidity);
    $("#current-uv").html(weatherObj.uvindex).addClass(status);
}

function renderFiveDay(weatherObjArr) {
    $(weatherObjArr).each(function(i, el) {
        var fiveDayId = "#five-day-" + i;
        $(fiveDayId).find(".five-day-date").html(el.date);
        $(fiveDayId).find(".five-day-icon").attr("src", "http://openweathermap.org/img/wn/"+el.icon+"@2x.png");
        $(fiveDayId).find(".five-day-temp").html(parseKelvinToFahrenheit(el.temp.max));
        $(fiveDayId).find(".five-day-wind").html(el.windspeed);
        $(fiveDayId).find(".five-day-humidity").html(el.humidity);
    });
}

function parseKelvinToFahrenheit(kelvin) {
    var fahrenheit = (((kelvin-273.15)*(9/5)) + 32).toFixed(2);
    return fahrenheit;
}

function getUvIndexStatus(index) {
    var status = "";
    if (index >= 0.00 && index <= 2.00) {
        //Low
        status = "low";
    } else if (index >= 3.00 && index <= 5.00) {
        //Moderate
        status = "moderate";
    } else if (index >= 6.00 && index <= 7.00) {
        //High
        status = "high";
    } else if (index >= 8.00 && index <= 10.00) {
        //Very High
        status = "very-high";
    } else {
        //Do Nothing
    }
    return status;
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
        date: new Date(weatherObj.dt * 1000).toDateString(),
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

