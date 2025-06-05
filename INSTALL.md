# Installation Guide

This section provides details of step by step instructions to run the [Open Bare Cropland Detection Model](https://github.com/Cognizant-RDMAI/BB2A-Identification-of-bare-cropland-from-satellite-images). Since the RDMAI team is not responsible for deploying this solution on customer premises, the setup focuses only on local or research-based use.

## 1. Prerequisites
 - The [Open Bare Cropland Detection Model](https://github.com/Cognizant-RDMAI/BB2A-Identification-of-bare-cropland-from-satellite-images) is developed using cloud-based Google Earth Engine (GEE) platform and codes are written in JavaScript language. To run the model, it doesn’t necessarily require installing Google Earth Engine in our system, but it requires a valid license and account to run the codes.
 - The model is optimized for catchment-level analysis due to its computational efficiency, enabling faster pixel-level processing. However, Google Earth Engine imposes pixel processing limits depending on the license type. For standard (free) users, batch tasks are typically limited to processing around 1 billion pixels per task, with a maximum of 2 concurrent batch tasks. Commercial users may access higher limits depending on their pricing plan and quota requests.
 - GEE FeatureCollection to the Console using print(), can only visualize the first 5000 records. This is a hard limit for visualization purposes to all license categories. However, you can still process or export the full dataset using Export.table.toDrive() or similar functions.

## 2. Required GEE assets 
 - Download Catchment data from https://environment.data.gov.uk/catchment-planning/ and add into GEE asset.
 - Add the crop mask asset contains CROME information into GEE (to be prepared in below manner).
 ```
 - Extract farmland (fclass = 'farmland') from OSM land use repository using QGIS/ArcGIS/programmatically.
 - Clip the farmland layer for targeted catchment.
 - Clip CROME crop type data for targeted catchment.
 - Dissolve CROME cropclasses spatially based on crop type and create centroid geometry from each class. This can be done using geospatial tool like QGIS/ArcGIS/programmatically.
 - Intersect the farmland and crop point dataset together to create a new Crop mask includes crop type. Add this layer as an crop mask asset in GEE.
```
 - Add catchment boundary in GEE
 - Add rainfall data into GEE
## 3. GEE Layers and User Interface
Once the model computes NDVI, SAVI, and BSI, each index can be visualized as a separate map layer in the GEE Code Editor. These layers help users interactively explore spatial patterns of vegetation, bare soil etc. At this moment there are seasonal (summer and winter) NDVI, SAVI and BSI. The key outputs can be found in three layers i.e. BSI Mask - All Seasons Bare Cropland, BSI Mask - Winter Bare Cropland, BSI Mask - Summer Bare Cropland.

<img src="https://github.com/user-attachments/assets/ea85c422-70dd-4af9-ba5d-922db1ffa0a4" width="180"/>

The True Colour Composite (TCC) and False Colour Composite (FCC) images from Sentinel 2 has been added as well for summer and winter as base imageries for visual interpretation. Generally, FCC appreas bright red to light red where there is healthy vegetation and appears brown to tan where there is bare soils. Whereas, in case of TCC, vegetation appears green and bare soil as brown or tan.


#### True Colour Composite (TCC)
<img src="https://github.com/user-attachments/assets/e549cf0b-39a9-4e9a-a34a-1062aca30420" width="400"/>

#### False Colour Composite (FCC)
<img src="https://github.com/user-attachments/assets/0c1b182f-37b4-4726-81b1-cd6c886d0a87" width="400"/>



## 4. Steps To Follow

Below are the core steps to run the model interactively:

## Step-1: Detect Bare Cropland From Satellite Images and Export Output
 - Sign in to GEE code editor and create new script save into GEE repo
 - Copy `gee_detect_bare_cropland.js` code from main branch and paste into newly created repo in GEE
**code description**
#### LOAD STUDY AREA AND CROPLAND DATA
```
// Load the boundary of the study area (e.g., a region of farmland)
var studyArea = ee.FeatureCollection('projects/**user gee account id**/assets/**user crop mask layer name**');

// Load a dataset that contains information about different crop types in the same area
var cropArea = ee.FeatureCollection('projects/**user gee account id**/assets/**user crop mask layer name**');
```
#### LOAD AND PREPARE SENTINEL-2 IMAGERY
```
// Load Sentinel-2 surface reflectance images
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(studyArea) // Only keep images that cover the study area
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) // Remove images with more than 20% cloud cover
  .map(function(image) {
    // Remove cloudy pixels using the cloud probability band
    var cloudProb = image.select('MSK_CLDPRB');
    var isNotCloud = cloudProb.lt(5); // Keep pixels with less than 5% cloud probability
    return image.updateMask(isNotCloud); // Mask out cloudy pixels
  })
  // Select relevant bands: Blue, Green, Red, Near-Infrared (NIR), and Shortwave Infrared (SWIR)
  .select(['B2', 'B3', 'B4', 'B8', 'B11']);
```
#### DEFINE VEGETATION AND SOIL INDICES
#### Bare Soil Index (BSI) helps identify bare land by comparing soil reflectance
```
function addBSI(image) {
  var bsi = image.expression(
    '((SWIR + RED) - (NIR + BLUE)) / ((SWIR + RED) + (NIR + BLUE))', {
      'SWIR': image.select('B11'),
      'RED': image.select('B4'),
      'NIR': image.select('B8'),
      'BLUE': image.select('B2')
    }).rename('BSI');
  return image.addBands(bsi); // Add BSI as a new band to the image
}
```
#### Soil Adjusted Vegetation Index (SAVI) is similar to NDVI but adjusts (L factor) for soil brightness
```
function addSAVI(image) {
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
      'NIR': image.select('B8'),
      'RED': image.select('B4'),
      'L': 0.5 // L is a correction factor for soil brightness
    }).rename('SAVI');
  return image.addBands(savi);
}
```
#### Normalized Difference Vegetation Index (NDVI) is a common index to measure vegetation health
```
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI'); // (NIR - RED) / (NIR + RED)
  return image.addBands(ndvi);
}
```
#### Apply all three indices to each image in the collection
```
var s2WithIndices = s2.map(addBSI).map(addSAVI).map(addNDVI);
```
#### FILTER IMAGES BY SEASON
#### Define winter and summer periods for analysis
```
var winter = s2WithIndices.filterDate('2023-12-01', '2024-03-31');
var summer = s2WithIndices.filterDate('2023-06-01', '2023-09-01');
```
#### Create a median composite image for each season (reduces noise and cloud effects)
```
var winterComposite = winter.median();
var summerComposite = summer.median();
```
#### IDENTIFY BARE CROPLAND USING THRESHOLDS
#### Use thresholds on BSI, SAVI, and NDVI to detect bare land in winter
```
var bareLandBSIWinter = winterComposite.select('BSI').gt(0.0).clip(studyArea); // BSI > 0
var bareLandSAVIWinter = winterComposite.select('SAVI').lt(0.3).clip(studyArea); // SAVI < 0.3
var bareLandNDVIWinter = winterComposite.select('NDVI').lt(0.3).clip(studyArea); // NDVI < 0.3
```
#### Detect bare land in summer using BSI
```
var bareLandBSISummer = summerComposite.select('BSI').gt(0.0).clip(studyArea);
```
#### Identify land that is bare in winter but not in summer
```
var deltaWinterBareLand = bareLandBSIWinter.and(bareLandBSISummer.not()).clip(studyArea);
```
#### Identify land that is bare in both seasons
```
var commonBareCropland = bareLandBSIWinter.and(bareLandBSISummer).clip(studyArea);
```
#### CALCULATE AREA STATISTICS
#### Function to calculate area (in square kilometers) of a given mask
```
function calculateArea(mask, description) {
  var pixelArea = ee.Image.pixelArea().updateMask(mask); // Only count pixels where mask is true
  var area = pixelArea.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: studyArea,
    scale: 10, // Sentinel-2 resolution is 10 meters
    maxPixels: 1e9
  }).get('area');
  area.evaluate(function(value) {
    var areaSqKm = value / 1e6; // Convert from square meters to square kilometers
    print(description + ' Area (km²):', areaSqKm);
  });
}
```
#### Function to calculate total area of the study region
```
function calculateTotalArea() {
  var totalPixelArea = ee.Image.pixelArea().clip(studyArea);
  var totalArea = totalPixelArea.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: studyArea,
    scale: 10,
    maxPixels: 1e9
  }).get('area');

  totalArea.evaluate(function(value) {
    var areaSqKm = value / 1e6;
    print('Total Study Area (km²):', areaSqKm);
  });
}
```
#### Run area calculations
```
calculateTotalArea();
calculateArea(bareLandBSIWinter, 'BSI Mask - Winter Bare Cropland');
calculateArea(bareLandSAVIWinter, 'SAVI Mask - Winter Bare Cropland');
calculateArea(bareLandNDVIWinter, 'NDVI Mask - Winter Bare Cropland');
calculateArea(bareLandBSISummer, 'BSI Mask - Summer Bare Cropland');
calculateArea(deltaWinterBareLand, 'BSI Mask - Winter Bare Cropland');
calculateArea(commonBareCropland, 'Common Bare Cropland');
```
#### VISUALIZE IMAGES AND MASKS
Create false color composites (NIR, Red, Green) to highlight vegetation
```
var winterFCC = winterComposite.select(['B8', 'B4', 'B3']).visualize({
  min: 0,
  max: 3000,
  gamma: 1.4
}).clip(studyArea);

var summerFCC = summerComposite.select(['B8', 'B4', 'B3']).visualize({
  min: 0,
  max: 3000,
  gamma: 1.4
}).clip(studyArea);
```
#### Create true color composites (Red, Green, Blue) for natural-looking images
```
var winterTCC = winterComposite.select(['B4', 'B3', 'B2']).visualize({
  min: 0,
  max: 3000,
  gamma: 1.4
}).clip(studyArea);

var summerTCC = summerComposite.select(['B4', 'B3', 'B2']).visualize({
  min: 0,
  max: 3000,
  gamma: 1.4
}).clip(studyArea);
```
#### Center the map on the study area
```
Map.centerObject(studyArea, 8);
```
#### Add layers to Map
```
//Add seasonal composites to the map

Map.addLayer(winterFCC, {}, 'FCC Winter');
Map.addLayer(summerFCC, {}, 'FCC Summer');
Map.addLayer(winterTCC, {}, 'TCC Winter');
Map.addLayer(summerTCC, {}, 'TCC Summer');

//Add vegetation and soil index layers

Map.addLayer(winterComposite.select('BSI').clip(studyArea), {min: -1, max: 1, palette: ['blue', 'white', 'brown']}, 'BSI Winter');
Map.addLayer(summerComposite.select('BSI').clip(studyArea), {min: -1, max: 1, palette: ['blue', 'white', 'brown']}, 'BSI Summer');
Map.addLayer(winterComposite.select('SAVI').clip(studyArea), {min: -1, max: 1, palette: ['white', 'lightgreen', 'green']}, 'SAVI Winter');
Map.addLayer(summerComposite.select('SAVI').clip(studyArea), {min: -1, max: 1, palette: ['white', 'lightgreen', 'green']}, 'SAVI Summer');
Map.addLayer(winterComposite.select('NDVI').clip(studyArea), {min: -1, max: 1, palette: ['white', 'lightgreen', 'green']}, 'NDVI Winter');
Map.addLayer(summerComposite.select('NDVI').clip(studyArea), {min: -1, max: 1, palette: ['white', 'lightgreen', 'green']}, 'NDVI Summer');

// Display masks for bare cropland

Map.addLayer(bareLandBSISummer.updateMask(bareLandBSISummer), {palette: 'blue'}, 'BSI Mask - Summer Bare Cropland');
Map.addLayer(deltaWinterBareLand.updateMask(deltaWinterBareLand), {palette: 'orange'}, 'BSI Mask - Winter Bare Cropland');
Map.addLayer(commonBareCropland.updateMask(commonBareCropland), {palette: 'green'}, 'BSI Mask - All Seasons Bare Cropland');
Map.addLayer(cropArea, {palette: 'orange'}, 'Cropland');
```
#### ADD LEGENDS
```
// Visualization parameters
var visParams = {
  NDVI: {min: -1, max: 1, palette: ['white', 'lightgreen', 'green']},
  SAVI: {min: -1, max: 1, palette: ['white', 'lightgreen', 'green']},
  BSI: {min: -1, max: 1, palette: ['blue', 'white', 'brown']}
};


// Unified legend panel at bottom
var legendPanel = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px',
    width: '250px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)'
  }
});
legendPanel.add(ui.Label({
  value: 'Legends',
  style: {fontWeight: 'bold', fontSize: '14px', margin: '0 0 6px 0'}
}));

// Function to create a color bar
function createColorBar(palette, min, max) {
  var colorBar = ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0).multiply((max - min) / 100.0).add(min)
      .visualize({min: min, max: max, palette: palette}),
    params: {bbox: [0, 0, 100, 10], dimensions: '100x10'},
    style: {stretch: 'horizontal', margin: '0px 8px'}
  });

  var labels = ui.Panel([
    ui.Label(min.toFixed(1), {fontSize: '10px'}),
    ui.Label('', {stretch: 'horizontal'}),
    ui.Label(max.toFixed(1), {fontSize: '10px', textAlign: 'right'})
  ], ui.Panel.Layout.Flow('horizontal'), {stretch: 'horizontal'});

  return ui.Panel([colorBar, labels]);
}

// Add checkboxes and legends
[
  {name: 'NDVI', vis: visParams.NDVI},
  {name: 'SAVI', vis: visParams.SAVI},
  {name: 'BSI', vis: visParams.BSI}
].forEach(function(layer) {
  var checkbox = ui.Checkbox(layer.name, false);
  var colorBarPanel = createColorBar(layer.vis.palette, layer.vis.min, layer.vis.max);
  colorBarPanel.style().set('shown', false);

  checkbox.onChange(function(checked) {
    colorBarPanel.style().set('shown', checked);
    Map.layers().forEach(function(mapLayer) {
      if (mapLayer.getName() === layer.name) {
        mapLayer.setShown(checked);
      }
    });
  });

  legendPanel.add(checkbox);
  legendPanel.add(colorBarPanel);
});

Map.add(legendPanel);
```
#### EXPORT THE WINTER BARE LAND MASK TO GOOGLE DRIVE
```
Export.image.toDrive({
  image: bareLandBSIWinter,
  description: 'BSI_Mask_Winter_Bare_Land',
  scale: 10,
  region: studyArea.geometry(),
  maxPixels: 1e9
});

// Exported data to be uploaded from **TASK** panel to the right side of GEE Console.
```
## Step-2: Generate Time Series Data Table Of Indices
 - create a new script for this activity and save to existing repo.
 - Copy `gee_extract_csv.js` code from main branch and paste into newly created repo in GEE.
**code description**

#### LOAD STUDY AREA
#### Load the cropland boundary as a FeatureCollection from your GEE assets
```
var studyArea = ee.FeatureCollection('projects/**user gee account id**/assets/**user crop mask layer name**');
```
#### DEFINE TIME RANGE
#### Set the start and end dates for the analysis (e.g., winter season of 2024). For example -
```
var startDate = '2024-12-01';
var endDate = '2025-02-28';
```
#### LOAD SENTINEL-2 DATA
#### Load Sentinel-2 surface reflectance images
```
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(studyArea) // Only include images that intersect the study area
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)) // Filter out images with more than 20% cloud cover
  .filterDate(startDate, endDate) // Filter by the defined date range
  .select(['B2', 'B3', 'B4', 'B8', 'B11', 'MSK_CLDPRB']); // Select relevant bands and cloud probability
```
#### DEFINE INDEX FUNCTIONS
#### Function to mask clouds using the MSK_CLDPRB band
```
function maskClouds(image) {
  // Bitwise operation to identify cloud-free pixels
  var cloudMask = image.select('MSK_CLDPRB').bitwiseAnd(1 << 10).eq(0);
  return image.updateMask(cloudMask); // Mask out cloudy pixels
}
```
#### Function to calculate NDVI (Normalized Difference Vegetation Index)
```
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI'); // (NIR - Red) / (NIR + Red)
  return image.addBands(ndvi);
}
```
#### Function to calculate SAVI (Soil Adjusted Vegetation Index)
```
function addSAVI(image) {
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
      'NIR': image.select('B8'),
      'RED': image.select('B4'),
      'L': 0.5 // Soil brightness correction factor
    }).rename('SAVI');
  return image.addBands(savi);
}
```
#### Function to calculate BSI (Bare Soil Index)
```
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
```
#### Function to calculate NDSI (Normalized Difference Snow Index)
```
function addNDSI(image) {
  var ndsi = image.normalizedDifference(['B3', 'B11']).rename('NDSI'); // (Green - SWIR) / (Green + SWIR)
  return image.addBands(ndsi);
}
```
#### Function to calculate NDMI (Normalized Difference Moisture Index)
```
// Function to calculate NDMI (Normalized Difference Moisture Index)
function addNDMI(image) {
  var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI'); // (NIR - SWIR) / (NIR + SWIR)
  return image.addBands(ndmi);
}
```
#### APPLY MASKS AND CALCULATE INDICES
#### Apply cloud masking and add all indices to each image in the collection
```
var s2Processed = s2
  .map(maskClouds)
  .map(addNDVI)
  .map(addSAVI)
  .map(addBSI)
  .map(addNDSI)
  .map(addNDMI);
```
#### CALCULATE MEAN INDEX VALUES PER FEATURE
#### For each image, calculate the mean value of each index for every feature (e.g., field) in the study area
```
function calculateFeatureStats(image) {
  return studyArea.map(function(feature) {
    var stats = image.reduceRegion({
      reducer: ee.Reducer.mean(), // Calculate mean value
      geometry: feature.geometry(), // Use the geometry of the feature
      scale: 10, // 10m Spatial resolution for calculation
      maxPixels: 1e7,
      bestEffort: true
    });
```
#### Attach the calculated stats and date to the feature
```
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
```
#### CREATE TIME SERIES FEATURE COLLECTION
#### Convert the processed image collection into a feature collection with index values over time
```
var timeSeries = ee.FeatureCollection(s2Processed.map(calculateFeatureStats).flatten())
  .filter(ee.Filter.notNull(['NDVI', 'SAVI', 'BSI', 'NDSI', 'NDMI'])); // Remove features with missing values
```
#### DISPLAY RESULTS IN TABLE FORMAT
#### Create a UI table chart to display index values for each feature and date
```
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
```
#### Print the table to the GEE console
```
print(table);

// This table will be displayed in console window and it can be maximized using top right corner arrow and likewise will find an option to downloaded as csv file as well.
```
## Step-3: Generate Time Series Charts Of Remote Sensing Indices
 - create a new script for this activity and save to existing repo.
 - Copy `gee_timeseries_indices.js` code from main branch and paste into newly created repo in GEE.
   
**code description**

#### LOAD STUDY AREA
#### Load the cropland boundary/exported BSI mask layer as a FeatureCollection from your GEE assets
```
var studyArea = ee.FeatureCollection('projects/**user gee account id**/assets/**user crop mask/ BSI mask layer name**');
```
#### DEFINE TIME RANGE
#### Set the start and end dates for the analysis (e.g., winter season of 2022-2023)
```
var startDate = '2022-12-20';
var endDate = '2023-02-28';
```
#### LOAD SENTINEL-2 DATA
#### Load Sentinel-2 surface reflectance images (already atmospherically corrected)
```
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(studyArea) // Only include images that intersect the study area
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 50)) // Filter out images with more than 50% cloud cover
  .filterDate(startDate, endDate) // Filter by the defined date range
  .select(['B2', 'B3', 'B4', 'B8', 'B11', 'MSK_CLDPRB']); // Select relevant bands and cloud probability
```
#### DEFINE INDEX FUNCTIONS
#### Function to mask clouds using the MSK_CLDPRB band
```
function maskClouds(image) {
  // Keep pixels with cloud probability less than 20%
  var cloudMask = image.select('MSK_CLDPRB').lt(20);
  return image.updateMask(cloudMask); // Mask out cloudy pixels
}
```
#### Function to calculate NDVI (Normalized Difference Vegetation Index)
```
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI'); // (NIR - Red) / (NIR + Red)
  return image.addBands(ndvi);
}
```
#### Function to calculate SAVI (Soil Adjusted Vegetation Index)
```
function addSAVI(image) {
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
      'NIR': image.select('B8'),
      'RED': image.select('B4'),
      'L': 0.5 // Soil brightness correction factor
    }).rename('SAVI');
  return image.addBands(savi);
}
```
#### Function to calculate BSI (Bare Soil Index)
```
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
```
#### Function to calculate NDMI (Normalized Difference Moisture Index)
```
function addNDMI(image) {
  var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI'); // (NIR - SWIR) / (NIR + SWIR)
  return image.addBands(ndmi);
}
```
#### Function to calculate NDSI (Normalized Difference Snow Index)
```
function addNDSI(image) {
  var ndsi = image.normalizedDifference(['B3', 'B11']).rename('NDSI'); // (Green - SWIR) / (Green + SWIR)
  return image.addBands(ndsi);
}
```
#### APPLY MASKS AND CALCULATE INDICES
#### Apply cloud masking and add all indices to each image in the collection
```
var s2Processed = s2
  .map(maskClouds)
  .map(addNDVI)
  .map(addSAVI)
  .map(addBSI)
  .map(addNDMI)
  .map(addNDSI);
```
#### CALCULATE MEAN INDEX VALUES PER IMAGE
#### For each image, calculate the mean value of each index for the entire study area
```
function calculateImageStats(image) {
  var stats = image.reduceRegion({
    reducer: ee.Reducer.mean(), // Calculate mean value
    geometry: studyArea, // Use the geometry of the study area
    scale: 10, // Spatial resolution for calculation
    maxPixels: 1e7, // Avoid memory overload
    bestEffort: true
  });
```
#### Create a feature with the calculated stats and date
```
  return ee.Feature(null, {
    'date': image.date().format('YYYY-MM-dd'),
    'NDVI': stats.get('NDVI'),
    'SAVI': stats.get('SAVI'),
    'BSI': stats.get('BSI'),
    'NDMI': stats.get('NDMI'),
    'NDSI': stats.get('NDSI')
  });
}
```
#### CREATE TIME SERIES FEATURE COLLECTION
#### Convert the processed image collection into a feature collection with index values over time
```
var timeSeries = s2Processed.map(calculateImageStats)
  .filter(ee.Filter.notNull(['NDVI', 'SAVI', 'BSI', 'NDMI', 'NDSI'])); // Remove features with missing values
```
#### CREATE AND DISPLAY TIME SERIES CHART
#### Extract the start and end years for the chart title
```
var startYear = ee.Date(startDate).get('year').getInfo();
var endYear = ee.Date(endDate).get('year').getInfo();
```
#### Create a time series chart to visualize the index values over time
```
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
```
#### Print the chart to the GEE console
```
print(chart);
```
## Step-4: Analyse Rainfall Data
```
//Load rainfall data for multiple stations from Earth Engine assets. For example, below are the three gauge station's rainfall data of Browney catchment in England.

var eshWinningData = ee.FeatureCollection('projects/gbg-nordics-sandbox/assets/ESH-Winning-rainfall-daily-Qualified');
var knitsleyMillData = ee.FeatureCollection('projects/gbg-nordics-sandbox/assets/Knitlsey-Mill-rainfall-daily-Qualified');
var tunstallData = ee.FeatureCollection('projects/gbg-nordics-sandbox/assets/Tunstall-rainfall-daily-Qualified');
```
#### Define the date range
```
//Set the start and end dates for filtering the rainfall data. For example -
var startDate = ee.Date('2024-12-01');
var endDate = ee.Date('2025-02-28');
```
#### Create a function to parse and filter data
```
// This function converts the 'date' string to a timestamp and filters by date range.
var parseAndFilterData = function(data) {
  return data.map(function(feature) {
    var date = ee.Date(feature.get('date')); // Convert 'date' to ee.Date
    return feature.set('system:time_start', date.millis()); // Set timestamp for charting
  }).filter(ee.Filter.date(startDate, endDate)); // Filter data by date range
};

// Apply the function to each dataset
// Parse and filter each rainfall dataset using the function above.
var filteredEshWinningData = parseAndFilterData(eshWinningData);
var filteredKnitsleyMillData = parseAndFilterData(knitsleyMillData);
var filteredTunstallData = parseAndFilterData(tunstallData);
```
#### Extract year information for chart titles
```
// Get the year from the start and end dates to use in chart titles.
var startYear = startDate.get('year').getInfo();
var endYear = endDate.get('year').getInfo();

// Create a function to generate charts
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
```
#### Generate charts for each station
```
//Create charts for each rainfall station using the filtered data.
var eshWinningChart = createChart(filteredEshWinningData, 'ESH-Winning Daily Rainfall');
var knitsleyMillChart = createChart(filteredKnitsleyMillData, 'Knitsley Mill Daily Rainfall');
var tunstallChart = createChart(filteredTunstallData, 'Tunstall Daily Rainfall');
```
#### Display the charts
```
//Print the charts to the Earth Engine Code Editor console.
print(eshWinningChart);
print(knitsleyMillChart);
print(tunstallChart);

// Each one of the charts can be maximized using top right corner arrow and likewise will give option to downloaded as csv, png, jpg format as well.
```

## Notes

* This guide assumes usage in a Google Earth Engine (GEE) environment.
* Please refer `README.md` for detailed description of the model.
