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


