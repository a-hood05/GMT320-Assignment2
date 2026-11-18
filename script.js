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
var provinces = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu Natal', 'Limpopo', 'Mpumalanga', 'Noeth West', 'Northern Cape', 'Western Cape'];
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

