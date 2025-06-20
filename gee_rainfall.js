
//--------------------------------
// Step 1: Define the study area
//--------------------------------
// Load the study area as a FeatureCollection from your Earth Engine assets.
var studyArea = ee.FeatureCollection('projects/rdmai-dev-ee/assets/browney_OPCAT');

//-----------------------------------
// Step 2: Load rainfall data assets
//-----------------------------------

// Load rainfall data for three stations from Earth Engine assets.
var eshWinningData = ee.FeatureCollection('projects/gbg-nordics-sandbox/assets/ESH-Winning-rainfall-daily-Qualified');
var knitsleyMillData = ee.FeatureCollection('projects/gbg-nordics-sandbox/assets/Knitlsey-Mill-rainfall-daily-Qualified');
var tunstallData = ee.FeatureCollection('projects/gbg-nordics-sandbox/assets/Tunstall-rainfall-daily-Qualified');

//----------------------------------
// Step 3: Define the date range
//----------------------------------

// Set the start and end dates for filtering the rainfall data.
var startDate = ee.Date('2022-12-01');
var endDate = ee.Date('2023-02-28');

//---------------------------------------------------
// Step 4: Create a function to parse and filter data
//------------------------------------------------------
// This function converts the 'date' string to a timestamp and filters by date range.
var parseAndFilterData = function(data) {
  return data.map(function(feature) {
    var date = ee.Date(feature.get('date')); // Convert 'date' to ee.Date
    return feature.set('system:time_start', date.millis()); // Set timestamp for charting
  }).filter(ee.Filter.date(startDate, endDate)); // Filter data by date range
};

//---------------------------------------------
// Step 5: Apply the function to each dataset
//---------------------------------------------
// Parse and filter each rainfall dataset using the function above.
var filteredEshWinningData = parseAndFilterData(eshWinningData);
var filteredKnitsleyMillData = parseAndFilterData(knitsleyMillData);
var filteredTunstallData = parseAndFilterData(tunstallData);

//---------------------------------------------------
// Step 6: Extract year information for chart titles
//---------------------------------------------------

// Get the year from the start and end dates to use in chart titles.
var startYear = startDate.get('year').getInfo();
var endYear = endDate.get('year').getInfo();

//------------------------------------------------
// Step 7: Create a function to generate charts
//------------------------------------------------
// This function builds a column chart for a given dataset and title.
var createChart = function(data, title) {
  return ui.Chart.feature.byFeature({
    features: data,
    xProperty: 'system:time_start', // X-axis: time
    yProperties: ['value']          // Y-axis: rainfall value
  }).setChartType('ColumnChart')    // Set chart type
    .setOptions({
      title: title + ' (' + startYear + '-' + endYear + ')', // Chart title
      hAxis: {
        title: 'Date',
        slantedText: true,
        slantedTextAngle: 30, // Tilt x-axis labels
        textStyle: { fontSize: 12 } // Font size for x-axis
      },
      vAxis: { title: 'Rainfall (mm)' }, // Y-axis label
      series: { 0: { color: 'blue' } },  // Bar color
      chartArea: { width: '80%' }       // Chart layout
    });
};

//------------------------------------------
// Step 8: Generate charts for each station
//------------------------------------------
// Create charts for each rainfall station using the filtered data.
var eshWinningChart = createChart(filteredEshWinningData, 'ESH-Winning Daily Rainfall');
var knitsleyMillChart = createChart(filteredKnitsleyMillData, 'Knitsley Mill Daily Rainfall');
var tunstallChart = createChart(filteredTunstallData, 'Tunstall Daily Rainfall');

//-----------------------------
// Step 9: Display the charts
//-----------------------------
// Print the charts to the Earth Engine Code Editor console.
print(eshWinningChart);
print(knitsleyMillChart);
print(tunstallChart);
