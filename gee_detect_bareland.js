
// ==========================
// 1. LOAD STUDY AREA AND CROPLAND DATA
// ==========================

// Load the boundary of the study area (e.g., a region of farmland)
var studyArea = ee.FeatureCollection('projects/ee-gangulykuntal/assets/farmlands_browney');

// Load a dataset that contains information about different crop types in the same area
var cropArea = ee.FeatureCollection('projects/ee-gangulykuntal/assets/farmlands_croptype_browney');


// ==========================
// 2. LOAD AND PREPARE SENTINEL-2 IMAGERY
// ==========================

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


// ==========================
// 3. DEFINE VEGETATION AND SOIL INDICES
// ==========================

// Bare Soil Index (BSI) helps identify bare land by comparing soil reflectance
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

// Soil Adjusted Vegetation Index (SAVI) is similar to NDVI but adjusts for soil brightness
function addSAVI(image) {
  var savi = image.expression(
    '((NIR - RED) / (NIR + RED + L)) * (1 + L)', {
      'NIR': image.select('B8'),
      'RED': image.select('B4'),
      'L': 0.5 // L is a correction factor for soil brightness
    }).rename('SAVI');
  return image.addBands(savi);
}

// Normalized Difference Vegetation Index (NDVI) is a common index to measure vegetation health
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI'); // (NIR - RED) / (NIR + RED)
  return image.addBands(ndvi);
}

// Apply all three indices to each image in the collection
var s2WithIndices = s2.map(addBSI).map(addSAVI).map(addNDVI);


// ==========================
// 4. FILTER IMAGES BY SEASON
// ==========================

// Define winter and summer periods for analysis
var winter = s2WithIndices.filterDate('2022-02-15', '2022-03-31');
var summer = s2WithIndices.filterDate('2023-06-01', '2023-09-01');

// Create a median composite image for each season (reduces noise and cloud effects)
var winterComposite = winter.median();
var summerComposite = summer.median();


// ==========================
// 5. IDENTIFY BARE LAND USING THRESHOLDS
// ==========================

// Use thresholds on BSI, SAVI, and NDVI to detect bare land in winter
var bareLandBSIWinter = winterComposite.select('BSI').gt(0.0).clip(studyArea); // BSI > 0
var bareLandSAVIWinter = winterComposite.select('SAVI').lt(0.3).clip(studyArea); // SAVI < 0.3
var bareLandNDVIWinter = winterComposite.select('NDVI').lt(0.3).clip(studyArea); // NDVI < 0.3

// Detect bare land in summer using BSI
var bareLandBSISummer = summerComposite.select('BSI').gt(0.0).clip(studyArea);

// Identify land that is bare in winter but not in summer
var deltaWinterBareLand = bareLandBSIWinter.and(bareLandBSISummer.not()).clip(studyArea);

// Identify land that is bare in both seasons
var commonBareCropland = bareLandBSIWinter.and(bareLandBSISummer).clip(studyArea);


// ==========================
// 6. CALCULATE AREA STATISTICS
// ==========================

// Function to calculate area (in square kilometers) of a given mask
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

// Function to calculate total area of the study region
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

// Run area calculations
calculateTotalArea();
calculateArea(bareLandBSIWinter, 'BSI Mask - Winter Bare Cropland');
calculateArea(bareLandSAVIWinter, 'SAVI Mask - Winter Bare Cropland');
calculateArea(bareLandNDVIWinter, 'NDVI Mask - Winter Bare Cropland');
calculateArea(bareLandBSISummer, 'BSI Mask - Summer Bare Cropland');
calculateArea(deltaWinterBareLand, 'BSI Mask - Winter Bare Cropland');
calculateArea(commonBareCropland, 'Common Bare Cropland');


// ==========================
// 7. VISUALIZE IMAGES AND MASKS
// ==========================

// Create false color composites (NIR, Red, Green) to highlight vegetation
var winterFCC = winterComposite.select(['B8', 'B4', 'B3']).visualize({
  min: 0,
  max: 3000,
  gamma: 1.4
}).clip(studyArea);

var summerFCC = summerComposite.select(['B8', 'B4', 'B3']).visualize({
  min: 0,
  max: 3000,
  gamma: 1.2
}).clip(studyArea);

// Create true color composites (Red, Green, Blue) for natural-looking images
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

// Center the map on the study area
Map.centerObject(studyArea, 8);

// Add seasonal composites to the map
Map.addLayer(winterFCC, {}, 'FCC Winter');
Map.addLayer(summerFCC, {}, 'FCC Summer');
Map.addLayer(winterTCC, {}, 'TCC Winter');
Map.addLayer(summerTCC, {}, 'TCC Summer');

// Add vegetation and soil index layers
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

// ==========================
// 8. ADD LEGENDS
// ==========================

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

// ==========================
// 9. EXPORT DATASET
// ==========================

// Export the winter bare land mask to Google Drive
Export.image.toDrive({
  image: bareLandBSIWinter,
  description: 'BSI_Mask_Winter_Bare_Land',
  scale: 10,
  region: studyArea.geometry(),
  maxPixels: 1e9
});
