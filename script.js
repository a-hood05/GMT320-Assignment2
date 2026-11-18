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

// Makes numbers look nice, e.g. 13531.2 -> "13 531"
function formatNumber(number) {
  return Math.round(number).toLocaleString("en-ZA");
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
  document.getElementById("highestName").innerHTML = highest.code + " (" + highest.province + ")";
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
    names.push(rows[k].code);
    incomes.push(rows[k].income);
  }
  topChart.data.labels = names;
  topChart.data.datasets[0].data = incomes;
  topChart.update();
}

