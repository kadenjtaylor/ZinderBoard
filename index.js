// For further info, see: https://open-meteo.com/en/docs/
function construct_query_url(lat, long, current, quarterly, hourly) {
  const endpoint = 'https://api.open-meteo.com/v1/forecast';
  var url = `${endpoint}?latitude=${lat}&longitude=${long}`;
  if (current.length != 0) {
    url += `&current=${current.join(",")}`;
  }
  if (quarterly.length != 0) {
    url += `&minutely_15=${quarterly.join(",")}`;
  }
  if (hourly.length != 0) {
    url += `&hourly=${hourly.join(",")}`;
  }
  return url;
}

async function fetch_data(url) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
  };
  const response = await fetch(url, { headers });
  const data = await response.json();
  return CurrentWeather.parse(data);
}

async function dummy_request(url) {
  console.log(`Ignoring ${url}, returning dummy result...`);
  const data = await fetch_data('./demo_response.json');
  return data;
}

class CurrentWeather {
  constructor(date, temp_c, wind_speed_km_h) {
    this.date = date;
    this.temp_c = temp_c;
    this.wind_speed_km_h = wind_speed_km_h;
  }

  static parse(data) {
    return new CurrentWeather(
      data["current"]["time"],
      data["current"]["temperature_2m"],
      data["current"]["wind_speed_10m"]
    )
  }

  render() {
    // When are we?
    const date = document.createElement("h1");
    const parsed_date = new Date(Date.parse(this.date));
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    date.innerText = `${parsed_date.toLocaleDateString("en-US", options)}`;
    date.style.textAlign = "center";
    date.style.fontSize = "100px";
    date.style.padding = "50px";

    // How hot is it?
    const temp = document.createElement("p");
    temp.innerText = `Temp:\n${this.temp_c} ${String.fromCharCode(176)}C`;
    temp.style.textAlign = "center";
    temp.style.float = "left";
    temp.style.width = "50%";
    temp.style.fontSize = "100px";

    const wind = document.createElement("p");
    wind.innerText = `Wind Speed:\n${this.wind_speed_km_h} km/h`;
    wind.style.textAlign = "center";
    wind.style.float = "right";
    wind.style.width = "50%";
    wind.style.fontSize = "100px";

    const info_container = document.createElement("div");
    info_container.style.display = "flex";
    info_container.appendChild(temp);
    info_container.appendChild(wind);

    const timestamp = document.createElement("p");
    timestamp.style.textAlign = "center";
    timestamp.style.fontSize = "50px";
    timestamp.innerText = `Last updated: ${this.date.split("T")[1]}`;

    const root = document.createElement("div");
    root.appendChild(date);
    root.appendChild(info_container);
    root.appendChild(timestamp);

    return root;
  }
}

async function populate_weather_widget(dummy_mode, refresh_rate_ms) {
  // Coordinates of Bushwick According to Google: 40.6958° N, 73.9171° W
  // Rounded to two decimal places to resemble API example
  const latitude = "40.70";
  const longitude = "73.92";

  // Info we want about the given location at different timescales
  const current_vars = ["temperature_2m", "wind_speed_10m"];
  const minutely_15_vars = [];
  const hourly_vars = [];

  // TODO: Set units for temperature/wind-speed (defaults appear to be in metric)
  const url = construct_query_url(latitude, longitude, current_vars, minutely_15_vars, hourly_vars);

  console.log("Fetching weather data...")
  let result;
  if (dummy_mode) {
    result = await dummy_request(url);
  } else {
    result = await fetch_data(url);
  }


  document.getElementById("weather").innerHTML = '';
  document.getElementById("weather").appendChild(result.render());

  setTimeout(() => populate_weather_widget(dummy_mode, refresh_rate_ms), refresh_rate_ms);
}


// Start point
const dummy_mode = true;
const refresh_interval_sec = 30;
populate_weather_widget(dummy_mode, refresh_interval_sec * 1000);