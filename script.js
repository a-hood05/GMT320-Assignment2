//Anoeska Hood u24671470
/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
//Got the code from https://www.w3schools.com/howto/howto_js_topnav_responsive.asp)
function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// make variables to make it easier to call later on
//All the rows from the csv file will be stored in a variable
var data = [];
//The charts variables
var lineChart;
var provinceChart;
var topChart;
//The map variables
var map;
var mapLayer;
//Stores the name of every municipality (from the GeoJSON), e.g. municipalityNames["NC091"] = "Sol Plaatje"
var municipalityNames = {};
//Store the provinces as a list so that it is easier to reference
var provinces = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];
//Also store the years as varaibles so that it is easier to reference
var years =[2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

//store each municipality or metro in its province
function getProvince(code) {
  if (code == "BUF" || code == "NMA" || code.startsWith("EC")) return "Eastern Cape";
  if (code == "MAN" || code.startsWith("FS")) return "Free State";
  if (code == "JHB" || code == "TSH" || code == "EKU" || code.startsWith("GT")) return "Gauteng";
  if (code == "ETH" || code.startsWith("KZN")) return "KwaZulu-Natal";
  if (code.startsWith("LIM")) return "Limpopo";
  if (code.startsWith("MP")) return "Mpumalanga";
  if (code.startsWith("NW")) return "North West";
  if (code.startsWith("NC")) return "Northern Cape";
  if (code == "CPT" || code.startsWith("WC")) return "Western Cape";
  return "Unknown";
}

//Load the csv file
// fetch() idea from https://www.w3schools.com/js/js_api_fetch.asp
fetch("data/Municipal_MedianIncome.csv")
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    // split the text into lines, then each line into its columns
    var lines = text.trim().split("\n");

    for (var i = 1; i < lines.length; i++) {   // start at 1 to skip the header row
      var columns = lines[i].split(",");
      var code = columns[0];
      var province = getProvince(code);

      // skip the "Unknown Location - Head Office Anomaly" rows
      if (province == "Unknown") {
        continue;
      }

      data.push({
        code: code,
        province: province,
        year: Number(columns[1]),
        income: Number(columns[2]),
        fte: Number(columns[3])
      });
    }

    console.log("Rows loaded: " + data.length);

    // now load the municipality boundaries for the map
    return fetch("data/municipalities.geojson");
  })
  .then(function (response) {
    return response.json();
  })
  .then(function (geojson) {
    makeMap(geojson);
    makeCharts();
    updateDashboard();
  });

  //filter the data with filterData function
  function filterData(province, year) {
  var result = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if ((province == "All" || row.province == province) && row.year == year) {
      result.push(row);
    }
  }
  return result;
}

//Summary statistcs
function getAverage(rows) {
  var total = 0;
  for (var i = 0; i < rows.length; i++) {
    total = total + rows[i].income;
  }
  return total / rows.length;
}

function getTotalFTE(rows) {
  var total = 0;
  for (var i = 0; i < rows.length; i++) {
    total = total + rows[i].fte;
  }
  return total;
}

function getHighest(rows) {
  var highest = rows[0];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i].income > highest.income) {
      highest = rows[i];
    }
  }
  return highest;
}

// Show numbers on charts
function formatNumber(number) {
  return Math.round(number).toLocaleString("en-ZA");
}

//Find the row for one municipality in one year
function findRow(code, year) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].code == code && data[i].year == year) {
      return data[i];
    }
  }
  return null;
}

//Colour for the map: darker blue = higher median income
//Based on the Leaflet choropleth tutorial https://leafletjs.com/examples/choropleth/
function getColor(income) {
  if (income > 24000) return "#104281";
  if (income > 18000) return "#256abf";
  if (income > 13000) return "#3987e5";
  if (income > 10000) return "#6da7ec";
  if (income > 7000)  return "#9ec5f4";
  return "#cde2fb";
}

//Create the map
//Based on https://leafletjs.com/examples/quick-start/ and https://leafletjs.com/examples/choropleth/
function makeMap(geojson) {
  // save the name of every municipality so the charts can show names instead of codes
  for (var i = 0; i < geojson.features.length; i++) {
    var properties = geojson.features[i].properties;
    municipalityNames[properties.CAT_B] = properties.MUNICNAME;
  }

  // centre the map on South Africa
  map = L.map("map").setView([-29, 25], 5);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 12,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // add the municipalities (the colours are set later in updateMap)
  mapLayer = L.geoJSON(geojson).addTo(map);

  // popup when you click on a municipality
  mapLayer.bindPopup(function (layer) {
    var code = layer.feature.properties.CAT_B;
    var year = Number(document.getElementById("yearSelect").value);
    var row = findRow(code, year);
    return "<b>" + municipalityNames[code] + "</b> (" + code + ")<br>" +
           "Median income " + year + ": R " + formatNumber(row.income) + "<br>" +
           "FTE employees: " + formatNumber(row.fte);
  });

  // legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    var grades = [0, 7000, 10000, 13000, 18000, 24000];
    div.innerHTML = "<b>Median income (R)</b><br>";
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ';
      if (i < grades.length - 1) {
        div.innerHTML += formatNumber(grades[i]) + " – " + formatNumber(grades[i + 1]) + "<br>";
      } else {
        div.innerHTML += formatNumber(grades[i]) + "+";
      }
    }
    return div;
  };
  legend.addTo(map);
}

//Update the map colours when the filters change
function updateMap(province, year) {
  mapLayer.setStyle(function (feature) {
    var code = feature.properties.CAT_B;
    var row = findRow(code, year);
    var colour = getColor(row.income);

    // municipalities outside the selected province are grey
    if (province != "All" && row.province != province) {
      colour = "#dddddd";
    }
    return { fillColor: colour, fillOpacity: 0.85, color: "white", weight: 1 };
  });

  // zoom to the selected province, or show the whole country
  if (province == "All") {
    map.setView([-29, 25], 5);
  } else {
    var bounds = L.latLngBounds([]);
    mapLayer.eachLayer(function (layer) {
      if (getProvince(layer.feature.properties.CAT_B) == province) {
        bounds.extend(layer.getBounds());
      }
    });
    map.fitBounds(bounds);
  }
}

//Create the charts
//The code is based on https://www.w3schools.com/ai/ai_chartjs.asp
function makeCharts() {
  // Line chart: income over the years
  lineChart = new Chart("lineChart", {
    type: "line",
    data: {
      labels: years,
      datasets: [{
        label: "Average median income (R)",
        data: [],
        borderColor: "#2a78d6",
        fill: false
      }]
    },
    options: {
      maintainAspectRatio: false,
      legend: { display: false }
    }
  });

  // Bar chart: compare the provinces
  provinceChart = new Chart("provinceChart", {
    type: "bar",
    data: {
      labels: provinces,
      datasets: [{
        label: "Average median income (R)",
        data: [],
        backgroundColor: []
      }]
    },
    options: {
      maintainAspectRatio: false,
      legend: { display: false },
      scales: { yAxes: [{ ticks: { beginAtZero: true } }] }
    }
  });

  // Horizontal bar chart: top 10 municipalities
  topChart = new Chart("topChart", {
    type: "horizontalBar",
    data: {
      labels: [],
      datasets: [{
        label: "Median income (R)",
        data: [],
        backgroundColor: "#04AA6D"
      }]
    },
    options: {
      maintainAspectRatio: false,
      legend: { display: false },
      scales: { xAxes: [{ ticks: { beginAtZero: true } }] }
    }
  });
}

//Now everything needs to update when filters change
function updateDashboard() {
  var province = document.getElementById("provinceSelect").value;
  var year = Number(document.getElementById("yearSelect").value);
  var rows = filterData(province, year);

  // The summary stats also needs to update as the filters are updated
  var highest = getHighest(rows);
  document.getElementById("avgIncome").innerHTML = "R " + formatNumber(getAverage(rows));
  document.getElementById("totalFTE").innerHTML = formatNumber(getTotalFTE(rows));
  document.getElementById("highest").innerHTML = "R " + formatNumber(highest.income);
  document.getElementById("highestName").innerHTML = municipalityNames[highest.code] + " (" + highest.province + ")";
  document.getElementById("municipalityCount").innerHTML = rows.length + " municipalities";

  //every chart also needs to update according to the filter
  //Line chart: average for every year and province selected in the filters
  var yearAverages = [];
  for (var i = 0; i < years.length; i++) {
    yearAverages.push(getAverage(filterData(province, years[i])));
  }
  lineChart.data.datasets[0].data = yearAverages;
  lineChart.update();

  //Bar chart: average for every province snd selected one should appear in a darker colour
  var provinceAverages = [];
  var colours = [];
  for (var j = 0; j < provinces.length; j++) {
    provinceAverages.push(getAverage(filterData(provinces[j], year)));
    if (provinces[j] == province) {
      colours.push("#184f95");
    } else {
      colours.push("#2a78d6");
    }
  }
  provinceChart.data.datasets[0].data = provinceAverages;
  provinceChart.data.datasets[0].backgroundColor = colours;
  provinceChart.update();

  // Top 10 chart: sort from highest to lowest and keep the first 10 and should be updated according to the province selected
  // sort() from https://www.w3schools.com/js/js_array_sort.asp
  rows.sort(function (a, b) { return b.income - a.income; });
  var names = [];
  var incomes = [];
  for (var k = 0; k < 10 && k < rows.length; k++) {
    names.push(municipalityNames[rows[k].code])
    incomes.push(rows[k].income);
  }
  topChart.data.labels = names;
  topChart.data.datasets[0].data = incomes;
  topChart.update();

  // Map: colour each municipality for the selected year
  updateMap(province, year);
}

