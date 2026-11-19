# GMT320-Assignment2: Dasboard visualisation of the median income for South African municipalities

Anoeska Hood;
u24671470;
GMA320;
University of Pretoria


Description:

This project explores how a dashboard can be built from a csv file sourced from the Spatial Economic Activity Data: South Africa (SEAD-SA) website. It was built using HTML, CSS and Javascript.
The dashboard shows the median income and full-time-equivalent (FTE) employment of South Africa's local and metropolitan municipalities for the tax years 2014-2025.


Task included:
1. Creating a web application using index.html, style.css and script.js
2. Adding three sections that is the heading and navigation bar, visualisation area (summary statistics, three charts and a map) and the footer
3. Adding two filters in a dropdown list for province and year
4. Loading the csv file, manipulating the records and calculating summary statistics
5. Making the statistics, charts and map update when the filters change
6. Using chart.js for the charts and Leaflet for the map
7. Styling the dashboard so that it looks professional and works on desktop and mobile


Dashboard features:
- Summary statistics: average median income, total FTE employees and the municipality with the highest median income
- Line chart: average mdeian income over time for the selected province compared with the national average
- Bar chart: average median income per province
- Horizontal bar chart: top 10 municipaities with the highest median income
- Map: map of median income per municipality with a legend and popup function


Dataset:

Source: SEAD_SA. 
Municipal_MedianIncome.csv structure: one row per municipality per tax year (2014-2025) with columns tax year, median income and number of FTE.
municipalities.geojson: municipal boundaries. The shapefile was cleaned in QGIS and exported as a geojson.
The rows labelled 'Unkown Location - Head Office Anomaly' are removed


Folder structure:
- index.html contains three sections, the heading and navigation bar, the visualisation area and footer. It links bootstrap 5's css, leaflet css, my style.css, chart.js as well as leaflet's and my own scripts.
- style.css styles the navigation bar (adapted from w3schools), summary cards, charts, map legend and the footer.
- script.js loads the csv and geojson files with fetch(), works out each municipality's province from its code, filters the data with loops and calculates the statistics. It also creates the charts and map and updates it.
- The data folder contains the csv and geojson files.


Credits:

The responsive navigation bar, fetch(), sort(), css grid and chart.js examples were from w3schools. The charts.js 2.9.4 were also from https://www.chartjs.org. The map and legend were from leaflet documentation and tutorials (https://leafletjs.com/examples/choropleth/).
