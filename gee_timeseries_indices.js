
// ==========================
// 1. LOAD STUDY AREA
// ==========================

// Load the boundary of the study area (e.g., a region of bare land) from your GEE assets
var studyArea = ee.FeatureCollection('projects/ee-gangulykuntal/assets/bareland_bsi_mask');

// ==========================
// 2. DEFINE TIME RANGE
// ==========================

// Set the start and end dates for the analysis (e.g., winter season of 2022-2023)
var startDate = '2022-12-20';
var endDate = '2023-02-28';

// ==========================
// 3. LOAD SENTINEL-2 DATA
// ==========================

// Load Sentinel-2 surface reflectance images (already atmospherically corrected)
var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
  .filterBounds(studyArea) // Only include images that intersect the study area
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50)) // Filter out images with more than 50% cloud cover
  .filterDate(startDate, endDate) // Filter by the defined date range
  .select(['B2', 'B3', 'B4', 'B8', 'B11', 'MSK_CLDPRB']); // Select relevant bands and cloud probability

// ==========================
// 4. DEFINE INDEX FUNCTIONS
// ==========================

// Function to mask clouds using the MSK_CLDPRB band
function maskClouds(image) {
  // Keep pixels with cloud probability less than 20%
  var cloudMask = image.select('MSK_CLDPRB').lt(20);
  return image.updateMask(cloudMask); // Mask out cloudy pixels
}

// Function to calculate NDVI (Normalized Difference Vegetation Index)
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI'); // (NIR - Red) / (NIR + Red)
  return image.addBands(ndvi);
}

// Function to calculate SAVI (Soil Adjusted Vegetation Index)
function addSAVI(image) {
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
      'NIR': image.select('B8'),
      'RED': image.select('B4'),
      'L': 0.5 // Soil brightness correction factor
    }).rename('SAVI');
  return image.addBands(savi);
}

// Function to calculate BSI (Bare Soil Index)
function addBSI(image) {
  var bsi = image.expression(
    '((SWIR + RED) - (NIR + BLUE)) / ((SWIR + RED) + (NIR + BLUE))', {
      'SWIR': image.select('B11'),
      'RED': image.select('B4'),
      'NIR': image.select('B8'),
      'BLUE': image.select('B2')
    }).rename('BSI');
  return image.addBands(bsi);
}

// Function to calculate NDMI (Normalized Difference Moisture Index)
function addNDMI(image) {
  var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI'); // (NIR - SWIR) / (NIR + SWIR)
  return image.addBands(ndmi);
}

// Function to calculate NDSI (Normalized Difference Snow Index)
function addNDSI(image) {
  var ndsi = image.normalizedDifference(['B3', 'B11']).rename('NDSI'); // (Green - SWIR) / (Green + SWIR)
  return image.addBands(ndsi);
}

// ==========================
// 5. APPLY MASKS AND CALCULATE INDICES
// ==========================

// Apply cloud masking and add all indices to each image in the collection
var s2Processed = s2
  .map(maskClouds)
  .map(addNDVI)
  .map(addSAVI)
  .map(addBSI)
  .map(addNDMI)
  .map(addNDSI);

// ==========================
// 6. CALCULATE MEAN INDEX VALUES PER IMAGE
// ==========================

// For each image, calculate the mean value of each index for the entire study area
function calculateImageStats(image) {
  var stats = image.reduceRegion({
    reducer: ee.Reducer.mean(), // Calculate mean value
    geometry: studyArea, // Use the geometry of the study area
    scale: 30, // Spatial resolution for calculation
    maxPixels: 1e7, // Avoid memory overload
    bestEffort: true
  });

  // Create a feature with the calculated stats and date
  return ee.Feature(null, {
    'date': image.date().format('YYYY-MM-dd'),
    'NDVI': stats.get('NDVI'),
    'SAVI': stats.get('SAVI'),
    'BSI': stats.get('BSI'),
    'NDMI': stats.get('NDMI'),
    'NDSI': stats.get('NDSI')
  });
}

// ==========================
// 7. CREATE TIME SERIES FEATURE COLLECTION
// ==========================

// Convert the processed image collection into a feature collection with index values over time
var timeSeries = s2Processed.map(calculateImageStats)
  .filter(ee.Filter.notNull(['NDVI', 'SAVI', 'BSI', 'NDMI', 'NDSI'])); // Remove features with missing values

// ==========================
// 8. CREATE AND DISPLAY TIME SERIES CHART
// ==========================

// Extract the start and end years for the chart title
var startYear = ee.Date(startDate).get('year').getInfo();
var endYear = ee.Date(endDate).get('year').getInfo();

// Create a time series chart to visualize the index values over time
var chart = ui.Chart.feature.byFeature({
  features: timeSeries,
  xProperty: 'date',
  yProperties: ['NDVI', 'SAVI', 'BSI', 'NDMI', 'NDSI']
})
.setChartType('LineChart')
.setOptions({
  title: 'Time Series of NDVI, SAVI, BSI, NDMI & NDSI (' + startYear + '-' + endYear + ')',
  hAxis: { 
    title: 'Date', 
    slantedText: true, 
    slantedTextAngle: 30, // Reduce slant angle for better readability
    textStyle: { fontSize: 12 } // Increase font size for better visibility
  },
  vAxis: { title: 'Index Values' },
  colors: ['green', 'blue', 'brown', 'purple', 'orange'],
  series: {
    3: { lineDashStyle: [4, 4] }, // NDMI in dotted line
    4: { lineDashStyle: [2, 2] }  // NDSI in dashed line
  },
  legend: { position: 'bottom' },
  lineWidth: 2,
  chartArea: { width: '80%' } // Increase chart area width
});

// Print the chart to the GEE console
print(chart);
