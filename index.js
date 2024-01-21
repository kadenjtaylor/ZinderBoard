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
  const response = await fetch(url);
  const data = await response.json();
  const p = document.createElement("pre");
  p.innerHTML = JSON.stringify(data, null, 4);
  document.body.appendChild(p);
}

function dummy_request(url) {
  console.log(`Ignoring ${url}, returning dummy result...`);
  fetch_data('./demo_response.json');
}

function parse_result(data) {
  // TODO: Implement
}

function main() {

  const dummy_mode = true;

  // Coordinates of Bushwick According to Google: 40.6958° N, 73.9171° W
  // Rounded to two decimal places to resemble API example
  const latitude = "40.70";
  const longitude = "73.92";

  // Info we want about the given location at different timescales
  const current_vars = ["temperature_2m", "wind_speed_10m"];
  const minutely_15_vars = [];
  const hourly_vars = ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"];

  // TODO: Set units for temperature/wind-speed (defaults appear to be in metric)
  const url = construct_query_url(latitude, longitude, current_vars, minutely_15_vars, hourly_vars);

  console.log(`Url: ${url}`);

  if (dummy_mode) {
    dummy_request(url);
  } else {
    fetch_data(url);
  }

}

main();