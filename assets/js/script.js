const openWeatherApiKey = "336ee374d3adce93770987a7cc399904";
const defaultSearchHistory = [];

//Get searchHistory from localStorage
function getSearchHistory() {
    var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || defaultSearchHistory;
    return searchHistory;
}

//Set setHistory to localStorage
function setSearchHistory(searchHistory) {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    renderSearchHistory(searchHistory);
}

async function weatherDashboardInit() {

    //Get Search History
    var searchHistory = await getSearchHistory();

    if (searchHistory) {
        renderSearchHistory(searchHistory);
        var weatherReport = await getWeatherReport(searchHistory[0]);
        if (weatherReport) {
            renderWeatherReport(weatherReport);
        }
    } else {
        //No searchHistory
    }
    
}

function renderSearchHistory(searchHistory) {
    var html = "";
    $(searchHistory).each(function(i, el){
        html += '<div class="history-item-wrapper">';
        html += '<button class="history-item" data-name="'+el.name+'" data-lat="'+el.lat+'" data-lon="'+el.lon+'">'+el.name+'</button>';
        html += '</div>'; 
    });
    $("#dash-history").html(html);
}

function renderWeatherReport(weatherReport) {
    if (weatherReport) {
        renderCurrent(weatherReport.current);
        renderFiveDay(weatherReport.fiveDay);
    }
}

function renderCurrent(weatherObj) {
    var status = getUvIndexStatus(weatherObj.uvindex);
    $("#current-city").html(weatherObj.name);
    $("#current-date").html(weatherObj.date);
    $("#current-icon").attr("src", "http://openweathermap.org/img/wn/"+weatherObj.icon+"@2x.png");
    $("#current-temp").html(parseKelvinToFahrenheit(weatherObj.temp) + "°F");
    $("#current-wind").html(weatherObj.windspeed + "°");
    $("#current-humidity").html(weatherObj.humidity + "%");
    $("#current-uv").html(weatherObj.uvindex).addClass(status);
}

function renderFiveDay(weatherObjArr) {
    $(weatherObjArr).each(function(i, el) {
        var forecastId = "#forecast-future-" + i;
        $(forecastId).find(".forecast-future-date").html(el.date);
        $(forecastId).find(".forecast-future-icon").attr("src", "http://openweathermap.org/img/wn/"+el.icon+"@2x.png");
        $(forecastId).find(".forecast-future-temp").html(parseKelvinToFahrenheit(el.temp.max) + "°F");
        $(forecastId).find(".forecast-future-wind").html(el.windspeed + "°");
        $(forecastId).find(".forecast-future-humidity").html(el.humidity + "%");
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

async function searchWeatherReport(locale, kill = false) {

    var geoData = await getGeoData(locale);

    if (geoData) {
        // Add geoData to searchHistory array
        addGeoDataToSearchHistory(geoData);

        // Get weatherReport
        var weatherReport = await getWeatherReport(geoData);
        return weatherReport;

    } else {
        // No geoData, Rescue or Error
        if(!kill) {
            //Rescue Response
            var rescueReport = await rescueWeatherReport(locale);
            return rescueReport;
        } else {
            //Error Response
            return false;
        }
    }
}

async function rescueWeatherReport(locale) {
    //Add USA to string, Check if successful
    var usaFix = locale + ", USA";
    var usaFixResponse = await searchWeatherReport(usaFix, true);

    if (usaFixResponse) {
        return usaFixResponse;
    } else {
        // Try future rescue attempt;
        return false;
    }

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
        if (data.length > 0) {
            var geoData = {
                name: data[0].name,
                lat: data[0].lat,
                lon: data[0].lon
            }
            return geoData;
        } else {
            return false;
        }
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

$(document).on('click', ".history-item", async function(e){
    e.preventDefault;
    var geoData = {
        name: e.target.dataset.name,
        lat: e.target.dataset.lat,
        lon: e.target.dataset.lon
    };
    var weatherReport = await getWeatherReport(geoData);
    renderWeatherReport(weatherReport);
});

$(document).on("click", "#dash-search-submit", async function(e){
    e.preventDefault();
    var input = $('#locale-input').val().trim();
    if (input){
        var weatherReport = await searchWeatherReport(input);
        if (weatherReport){
            renderWeatherReport(weatherReport);
            $('#locale-input').val('');
        }
    }
});

