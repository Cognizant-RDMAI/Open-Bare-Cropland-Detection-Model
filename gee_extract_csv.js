
// ==========================
// 1. LOAD STUDY AREA
// ==========================

// Load the cropland boundary as a FeatureCollection from your GEE assets
var studyArea = ee.FeatureCollection("projects/ee-gangulykuntal/assets/farmlands_croptype_browney");


// ==========================
// 2. DEFINE TIME RANGE
// ==========================

// Set the start and end dates for the analysis (e.g., winter season of 2021)
var startDate = '2021-01-01';
var endDate = '2021-03-31';


// ==========================
// 3. LOAD SENTINEL-2 DATA
// ==========================

// Load Sentinel-2 surface reflectance images
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(studyArea) // Only include images that intersect the study area
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)) // Filter out images with more than 30% cloud cover
  .filterDate(startDate, endDate) // Filter by the defined date range
  .select(['B2', 'B3', 'B4', 'B8', 'B11', 'MSK_CLDPRB']); // Select relevant bands and cloud probability


// ==========================
// 4. DEFINE INDEX FUNCTIONS
// ==========================

// Function to mask clouds using the MSK_CLDPRB band
function maskClouds(image) {
  // Bitwise operation to identify cloud-free pixels
  var cloudMask = image.select('MSK_CLDPRB').bitwiseAnd(1 << 10).eq(0);
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

// Function to calculate NDSI (Normalized Difference Snow Index)
function addNDSI(image) {
  var ndsi = image.normalizedDifference(['B3', 'B11']).rename('NDSI'); // (Green - SWIR) / (Green + SWIR)
  return image.addBands(ndsi);
}

// Function to calculate NDMI (Normalized Difference Moisture Index)
function addNDMI(image) {
  var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI'); // (NIR - SWIR) / (NIR + SWIR)
  return image.addBands(ndmi);
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
  .map(addNDSI)
  .map(addNDMI);


// ==========================
// 6. CALCULATE MEAN INDEX VALUES PER FEATURE
// ==========================

// For each image, calculate the mean value of each index for every feature (e.g., field) in the study area
function calculateFeatureStats(image) {
  return studyArea.map(function(feature) {
    var stats = image.reduceRegion({
      reducer: ee.Reducer.mean(), // Calculate mean value
      geometry: feature.geometry(), // Use the geometry of the feature
      scale: 30, // Spatial resolution for calculation
      maxPixels: 1e7,
      bestEffort: true
    });

    // Attach the calculated stats and date to the feature
    return feature.set({
      'Date': image.date().format('YYYY-MM-dd'),
      'NDVI': stats.get('NDVI'),
      'SAVI': stats.get('SAVI'),
      'BSI': stats.get('BSI'),
      'NDSI': stats.get('NDSI'),
      'NDMI': stats.get('NDMI')
    });
  });
}


// ==========================
// 7. CREATE TIME SERIES FEATURE COLLECTION
// ==========================

// Convert the processed image collection into a feature collection with index values over time
var timeSeries = ee.FeatureCollection(s2Processed.map(calculateFeatureStats).flatten())
  .filter(ee.Filter.notNull(['NDVI', 'SAVI', 'BSI', 'NDSI', 'NDMI'])); // Remove features with missing values


// ==========================
// 8. DISPLAY RESULTS IN TABLE FORMAT
// ==========================

// Create a UI table chart to display index values for each feature and date
var table = ui.Chart.feature.byFeature(timeSeries)
  .setChartType('Table')
  .setOptions({
    title: 'Index Values for Each Date and osm_id',
    pageSize: 10, // Number of rows per page
    columns: [
      {label: 'osm_id', type: 'string'},
      {label: 'Date', type: 'string'},
      {label: 'NDVI', type: 'number'},
      {label: 'SAVI', type: 'number'},
      {label: 'BSI', type: 'number'},
      {label: 'NDSI', type: 'number'},
      {label: 'NDMI', type: 'number'}
    ]
  });

// Print the table to the GEE console
print(table);
