# Open Bare Cropland Detection Model
## 1. Introduction
Water pollution continues to pose a serious global threat, impacting rivers, lakes, estuaries, and coastal ecosystems. A major contributor to this issue is non-point source pollution—also referred to as diffuse pollution. Non-point sources of water pollution are those that don’t originate from a single, discrete source, but are rather contaminants introduced to the watercourse over a large area. As such, non-point pollution is much more difficult to identify and manage compared to point sources. Agricultural runoff is a key component of this type of pollution. During certain periods in the farming cycle, such as post-harvest or pre-planting, croplands are often left bare, making them particularly vulnerable to erosion and the leaching of nutrients and agrochemicals.

These exposed soils, especially during rainy seasons, can significantly accelerate the transport of sediments, fertilizers, and pesticides into nearby water bodies. Monitoring such bare cropland areas is therefore essential for identifying potential pollution hotspots and informing mitigation strategies.

To support this effort, an Open Bare Cropland Detection Model has been developed, leveraging satellite-derived spectral indicators to evaluate bare soil exposure, vegetation cover, and surface conditions such as snow and moisture presence. Combined with weather data, the model enables accurate monitoring of surface dynamics throughout the seasons. This enhances the ability to track fallow periods, detect land degradation, and inform sustainable land and water resource management strategies.

## 2. Motivation
Bare cropland detection is useful for identifying water pollution sources because these areas can contribute significantly to runoff, carrying pollutants like fertilisers, pesticides, and sediment into nearby water bodies. Identifying bare cropland helps in pinpointing potential pollution hotspots and implementing targeted measures to mitigate water contamination.

## 3. RDMAI Overview
River Deep Mountain AI (RDMAI) is an innovation project funded by the Ofwat Innovation Fund working collaboratively to develop open-source AI/ML models that can inform effective actions to tackle waterbody pollution.  
  
The project consists of 6 core partners: Northumbrian Water, Cognizant Ocean, Xylem Inc, Water Research Centre Limited, The Rivers Trust and ADAS. The project is further supported by 6 water companies across the United Kingdom and Ireland. 

## 4.	Purpose and Functionality
The primary purpose of this project is to develop a remote sensing-based model capable of detecting and monitoring bare cropland surfaces across agricultural landscapes using high-resolution satellite imagery. Bare croplands are critical indicators of land exposure and potential environmental vulnerability. Mapping their extent supports a range of downstream applications such as:

 - Soil erosion risk assessment
 - Diffuse pollution monitoring and mitigation
 - Agricultural land management and planning
 - Crop rotation and fallow land analysis
 - Dynamic land use mapping and environmental reporting

The model is designed to function as part of a fully automated geospatial pipeline. It performs the following core functions:

**Identification:** Identify bare cropland areas using spectral analysis of satellite imagery, primarily leveraging the Bare Soil Index (BSI) alongside other vegetation indices such as NDVI and SAVI.

**Classification:** Differentiate bare soil from vegetated or non-agricultural surfaces using threshold-based classification of spectral indices, ensuring consistent and   objective interpretation.

**Integration:** Export results as GeoTIFF or Shape files compatible with GIS platforms like QGIS, ArcGIS, and Google Earth Engine.

**Scalability:** Can be applied accross catchments in England, enable near real-time monitoring across seasons and years using freely available satellite data (Sentinel 2), supporting regional to national scale assessments.

Unlike traditional field-based surveys or commercial licensed land use datasets — which are often infrequent, costly, and limited in resolution—this Open Bare Cropland Model offers a dynamic, cost-effective, and repeatable alternative. By utilizing open-access satellite imagery at 10m spatial resolultion, it empowers stakeholders with timely insights into land surface conditions, enhancing environmental stewardship and agricultural decision-making.

## 5. Installation Instructions
To get started with the Bare cropland detection model:
### 5.1 Prerequisites
 - The [Open Bare Cropland Detection Model](https://github.com/Cognizant-RDMAI/BB2A-Identification-of-bare-cropland-from-satellite-images) is developed using cloud-based Google Earth Engine (GEE) platform and codes are written in JavaScript language. To run the model, it doesn’t necessarily require installing Google Earth Engine in our system, but it requires a valid license and account to run the codes.
 - The model is optimized for catchment-level analysis due to its computational efficiency, enabling faster pixel-level processing. However, Google Earth Engine imposes pixel processing limits depending on the license type. For standard (free) users, batch tasks are typically limited to processing around 1 billion pixels per task, with a maximum of 2 concurrent batch tasks. Commercial users may access higher limits depending on their pricing plan and quota requests.
 - GEE FeatureCollection to the Console using print(), can only visualize the first 5000 records. This is a hard limit for visualization purposes to all license categories. However, you can still process or export the full dataset using Export.table.toDrive() or similar functions.
### 5.2. Clone the repository
First, clone this project to your local machine or cloud environment
```https://github.com/Cognizant-RDMAI/OpenBareCroplandDetectionModel```. This will download all model files including scripts.
### 5.3. Install dependencies
A valid GEE license and account to run the codes.
### 5.4. Data Sources and Preprocessing
#### 5.4.1. Satellite Data: 
Sentinel-2 imagery is available in several processing levels. The three most commonly used data products are Top of Atmosphere (TOA) Reflectance and Bottom of Atmosphere (BOA) like Surface Reflectance (SR), and Harmonized Surface Reflectance (Harmonized SR or HLS). In this work we have utlized Harmonized SR imageries for model development.
 - TOA is the raw reflectance measured by the satellite sensors, including the effects of the atmosphere (e.g., clouds, aerosols, water vapor). Hence, it is not ideal for direct land surface analysis due to atmospheric distortions.
 - SR product has been atmospherically corrected to estimate the reflectance at the Earth’s surface, removing most atmospheric effects.
 - HLS or Harmonized SR dataset combines atmospherically corrected surface reflectance from both Sentinel-2 and Landsat missions, harmonized to ensure consistency in radiometry, geometry, and cloud masking.

This dataset also comes orthorectified imagery at 10–60m resolution with 13 multispectral bands and 5 days revisit frequency.

Table 1. Sentinel 2 image spectral band specifications
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>


Band | Description | Wavelength   (µm) | Resolution   (m)
-- | -- | -- | --
Band 1 | Coastal aerosol | 0.443 | 60
Band 2 | Blue | 0.490 | 10
Band 3 | Green | 0.560 | 10
Band 4 | Red | 0.665 | 10
Band 5 | Vegetation Red Edge | 0.705 | 20
Band 6 | Vegetation Red Edge | 0.740 | 20
Band 7 | Vegetation Red Edge | 0.783 | 20
Band 8 | NIR | 0.842 | 10
Band 8A | Vegetation Red Edge | 0.865 | 20
Band 9 | Water vapour | 0.945 | 60
Band 10 | SWIR - Cirrus | 1.375 | 60
Band 11 | SWIR | 1.610 | 20
Band 12 | SWIR | 2.190 | 20

</div>

<!--EndFragment-->
</body>

</html>

#### 5.4.2. Creating Composite image
This method is commonly used in remote sensing to reduce noise (e.g., clouds, shadows) and produce a cleaner, more representative image.
#### Example
<p align="left">
  <img src="https://github.com/user-attachments/assets/5e7880d5-3636-483a-97c4-d7996a206d82" width="400"/>
</p>
Figure 1. Illustration of creating satellite image composite


The above example demonstrates how satellite image composite is being generated. For example, above each subplot shows a 3×3 image. The composite image (bottom right) is created by taking the median value at each pixel location across the three input images.

In Google Earth Engine (GEE), composite images have been generated for agricultural periods i.e. Winter (Nov/Dec-Feb/March) and Summer (Jun-Aug), to capture seasonal variations in croplands.


<body lang=EN-IN style='tab-interval:36.0pt;word-wrap:break-word'>
<!--StartFragment-->

<p class=MsoNormal style='margin-left:18.0pt;text-align:justify'>Table 2. Visual
Comparison<o:p></o:p></p>


Feature | Raw Image | Median   Composite
-- | -- | --
Cloud   Coverage | Often present | Mostly   removed
Temporal   Accuracy | Exact date | Time-averaged
Noise Level | Higher | Lower



<!--EndFragment-->
</body>

</html>


**Temporal Scope:** Imagery was selected for key agricultural periods—winter to early spring (Nov/Dec-Feb/March), mid-summer (Jun-Aug), and post-harvest (Sept-Nov)—to capture seasonal variations in land cover.

**Cloud Masking:** The present method has considered less than 20% cloudy pixels while selecting the Sentinel 2 satellite images.

#### 5.5. Input data preparation
#### 5.5.1. Crop mask
This model requires a crop mask to run the model effectively and avoiding misclassification of other land use classes. In this work, we have opted to use the openly available farmland boundary data from OpenStreetMap (OSM) land cover data to isolate agricultural areas for analysis. This data, which includes polygons tagged as fclass = farmland, is extracted and converted into a vector layer (e.g., shapefile). In GEE, it is imported as a FeatureCollection and used to clip satellite imagery or mask out non-agricultural land, ensuring that remote sensing models focus only on cropland.

<img width="511" alt="image" src="https://github.com/user-attachments/assets/c1b16e48-f081-44de-ad14-5a188162b8d3" />

Figure 2. OSM farmland layer

**Source:** Download Open Street Map (OSM) Landuse data from https://download.geofabrik.de/europe/united-kingdom.html
#### Limitations: 
While OSM is a valuable open-source platform maintained by a global community of contributors, it is important to acknowledge the following limitations, such as -
 - **Data Completeness:** OSM coverage is generally more comprehensive in urban and semi-urban areas. In rural regions, including agricultural zones, the completeness of farmland boundaries may vary depending on contributor activity.
 - **Positional Accuracy:** Studies have shown that OSM features in the UK typically have good positional accuracy (within a few meters), but this can vary locally.
 - **Update Frequency:** OSM data is updated continuously by volunteers, but there is no guaranteed schedule for updates or quality control.
#### 5.4.2. Integrating OSM Crop mask and CROME datasets
The CROME dataset uses a hexagonal grid system to divide the landscape into uniform cells. This data has been enhanced by adding crop description. This layer has been combined with OSM crop mask layer to enhance the mask information.

<img width="500" alt="image" src="https://github.com/user-attachments/assets/5cb16ea0-0c4a-4010-80ea-e97466540750" /> 

Figure 3. CROME dataset integrated with OSM farmland layer

**Source:** Download CROME crop type data from https://environment.data.gov.uk/explore/f0f54bc1-b77a-42c8-b601-2f4aaf4dd851?download=true

#### 5.5.2. Incorporating Rainfall Data
Historical rainfall data was downloaded from DEFRA's Hydrology Explorer for gauge stations located within each catchment. This ground-based data was then used in Google Earth Engine to compare with satellite-derived moisture indices like NDMI, enabling a more robust assessment of soil moisture variability and hydrological conditions. The current approach also applicable to integrate any other type of rainfall dataset as well.

![image](https://github.com/user-attachments/assets/36184bec-bb26-45e2-938f-585beebdcef4)

Figure 4. Rainfall data

**Source:** Download catchment level rainfall data (daily in .CSV) of each gauge stations required for analysis from https://environment.data.gov.uk/hydrology/explore.

 #### 5.5.3. GEE asset creation
 - Download Catchment data from https://environment.data.gov.uk/catchment-planning/ and add into GEE asset.
 - Add the crop mask asset contains CROME information into GEE (to be prepared in below manner).
 ```
 - Extract farmland (fclass = 'farmland') from OSM landuse repository using QGIS/ArcGIS/programatically.
 - Clip the farmland layer for targetted catchment.
 - Clip CROME crop type data for targetted catchment.
 - Dissolve CROME crop classes spatially based on crop type and create centroid geometry from each class. This can be done using geospatial tool like QGIS/ArcGIS/programatically.
 - Intersect the farmland and crop point dataset together to create a new Crop mask includes crop type. Add this layer as an crop mask asset in GEE.
```
### 5.6. Use of Remote Sensing Indices
This model leverages quantitative spectral indices like Normalized Difference Vegetation Index (NDVI), Soil Adjusted Vegetation Index (SAVI), and Bare Soil Index (BSI) provide quantitative, standardized metrics that remove ambiguity and interpretable outputs for land surface analysis. Spectral characteristics of BSI, NDVI, and SAVI provides a powerful way to understand the biophysical characteristics of the Earth's surface, especially in agricultural or semi-natural landscapes. Based on analysis of all such indices and their performance we have considered BSI index as key index for Bare cropland detection.

Table 3. Remote Sensing Indices

| **Index** | **Formula**     | **Threshold** | **Purpose** | **Reference** |
|----------|-----------------|---------------|-------------|---------------|
| **BSI** | ((SWIR + RED) -<br>(NIR + BLUE)) /<br>((SWIR + RED) +<br>(NIR + BLUE))     | > 0 (Bare soil) | Exposed soil detection | Mzid et al., 2021 |
| **NDVI** | (NIR - RED) /<br>(NIR + RED)     | > 0.4 (Vegetation) | Vegetation health | Rouse et al., 1974 |
| **SAVI** | ((NIR - RED) /<br>(NIR + RED + L)) ×<br>(1 + L)     | > 0.4 (Vegetation) | Soil-adjusted vegetation | Huete, 1988 |
| **NDMI** | (NIR - SWIR) /<br>(NIR + SWIR)     | > 0.4 (No stress) | Moisture in vegetation | Gao, 1996 |
| **NDSI** | (GREEN - SWIR1) /<br>(GREEN + SWIR1)     | > 0.4 (Snow) | Snow detection | Hall & Riggs, 2011 |

 - **GREEN** = Reflectance in the green band
 - **RED** = Reflectance in the red band
 - **NIR (Near Infra-Red)** = Reflectance in the near-infrared band
 - **SWIR (Short Wave Infra-Red)** Reflectance in the short wave-infrared band.
 - **L** = Soil brightness correction factor (commonly L = 0.5)

#### Spectral Profiles for Surface Feature Analysis
Spectral reflectance varies across the Green, Red, NIR, and SWIR bands depending on surface conditions. The following examples are taken from the Browney Catchment, an area predominantly used for agriculture. Histograms were generated for both the summer and winter seasons of 2024 to analyze surface conditions in addition to index-based assessments.

<img width="500" alt="image" src="https://github.com/user-attachments/assets/7af6fcc3-e08b-4630-b70b-315b39a0d9a6" />   <img width="500" alt="image" src="https://github.com/user-attachments/assets/bb797302-20ea-46cb-979f-dc636e5480c8" />

Figure 5. Variations in spectral reflectance during summer and winter

Table 4. Seasonal Reflectance Distribution Comparison

| **Band**   | **Summer Reflectance Range** | **Winter Reflectance Range** | **Interpretation** |
|------------|-------------------------------|-------------------------------|---------------------|
| **Blue**   | 0.02 – 0.20                   | 0.03 – 0.09                   | Summer shows more variation; winter is more uniform. |
| **Green**  | 0.02 – 0.24                   | 0.03 – 0.11                   | Higher and broader in summer due to active vegetation. |
| **Red**    | 0.012 – 0.22                  | 0.02 – 0.14                   | Summer reflects more, indicating diverse surfaces. |
| **NIR**    | 0.12 – 0.74                   | 0.06 – 0.48                   | Much higher in summer, showing dense vegetation. |
| **SWIR1**  | 0.04 – 0.68                   | 0.03 – 0.26                   | Summer indicates more moisture; winter is drier. |
| **SWIR2**  | 0.2852 – 0.32                 | 0.02 – 0.16                   | Summer is more reflective; winter suggests bare or dry surfaces. |


#### Normalized Vegetation Index (NDVI)
 - High NDVI values (>0.6): Dense, healthy vegetation (e.g., forests, crops in peak growth).
 - Moderate values (0.3 to 0.5): Sparse or stressed vegetation.
 - Low or negative values (< 0.3): Bare soil, built-up areas, or water bodies.

#### Soil Adjusted Vegetation Index (SAVI)
 - SAVI values follow a similar pattern to NDVI but are less sensitive to soil reflectance.
 - In semi-arid or bare areas, SAVI provides a more stable vegetation signal than NDVI.

Table 5. Interpreting SAVI values
<body lang="EN-IN" style="tab-interval:36.0pt;word-wrap:break-word">
<!--StartFragment-->

<div align="left">
  <table cellspacing="0" cellpadding="5">
    <thead>
      <tr>
        <th>SAVI Range</th>
        <th>Interpretation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>&lt; 0.2</td>
        <td>Likely bare soil or very sparse vegetation</td>
      </tr>
      <tr>
        <td>0.2 – 0.3</td>
        <td>Transitional zone (sparse vegetation)</td>
      </tr>
      <tr>
        <td>&gt; 0.3</td>
        <td>Increasing vegetation density</td>
      </tr>
    </tbody>
  </table>
</div>

<!--EndFragment-->
</body>

#### Why NDVI and SAVI alone are not enough to detect bare cropland?
Both NDVI and SAVI are Near Infra-Red (NIR) based vegetation indices, meaning they primarily measure the presence and vigour of vegetation by comparing the reflectance in the NIR and Red bands. However, bare soil can sometimes reflect moderate NIR, especially if it's dry or has light-coloured minerals.
Sparse vegetation or crop residues can confuse NDVI/SAVI, leading to false positives for vegetation. These indices are less sensitive to soil characteristics, such as moisture, texture, or organic content.

#### Bare Soil Index (BSI) as Key Index
With respect to some studies related to bare land mapping using multispectral images, Bare Soil Index (BSI) has achieved better accuracy. The Bare Soil Index was developed to better isolate bare soil by incorporating multiple spectral bands, not just NIR and Red. 

<body lang=EN-IN style='tab-interval:36.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>

Table 6. Understanding SWIR pattern for different land cover
Property | SWIR   Response
-- | --
Dry bare soil | High   reflectance
Moist soil | Lower   reflectance
Vegetation | Low reflectance   (due to water content)
Water | Very low   reflectance

</div>

<!--EndFragment-->
</body>

</html>

Based on image interpretation and spectral characteristics, BSI threshold has been decided.

Table 7. Interpreting BSI thresholds
<body lang="EN-IN" style="tab-interval:36.0pt;word-wrap:break-word">
<!--StartFragment-->

<div align="left">
  <table cellspacing="0" cellpadding="5">
    <thead>
      <tr>
        <th>BSI Value</th>
        <th>Likely Surface Type</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>&gt; 0</td>
        <td>Bare soil, built-up, dry land</td>
      </tr>
      <tr>
        <td>&lt; 0</td>
        <td>Vegetation, water, moist soil</td>
      </tr>
    </tbody>
  </table>
</div>

<!--EndFragment-->
</body>


This threshold is also useful for
 - A binary classification (bare vs. non-bare).
 - Building a mask for bare soil detection.
 - Working with large-scale monitoring and need a simple rule.
These indices are often used as inputs for machine learning models, classification algorithms, or threshold-based decision systems.

#### Examples
A demonstration is shown in the figure below, where the below image is the farmlands (Browney catchment, UK) false colour composite of three near infra-red, red and green bands from Sentinel 2 harmonized surface reflectance image and the image to its below is the extracted bare cropland in summer (blue areas) and winter (amber areas).
<img src="https://github.com/user-attachments/assets/29e5d017-00b6-4443-bea7-2b2b60d82a4b" width="800"/>

Figure 6. Detected winter and summer bare cropland

### 5.7. Operational Challenges and Adaptive Solutions
Weather events (snow and rainfall) in the United Kingdom, can significantly alter surface reflectance captured by satellite sensors, often introducing anomalies or biases in spectral indices used for vegetation and soil analysis. 
To address this, the model incorporates a robust feature that utilizes spectral index time series to differentiate between bare soil and surfaces influenced by weather conditions. By examining the temporal patterns of multiple indices—NDVI, SAVI, BSI, NDMI, and NDSI—the model can accurately infer surface conditions with high sensitivity over time, ensuring more reliable analysis even under variable environmental conditions.

#### 5.7.1. Weather Effects on Detection Accuracy
The below image (left) demonstrated the impact of snow cover in the Browney Catchment (UK) during January 2023 on model output'. The image on the right shows the improvement in model predictions just a month later during the snow-free period.

<img src="https://github.com/user-attachments/assets/a90a8d26-920a-412b-8cee-96013f87a816" width="800"/>

Figure 7. Weather effects on detection accuracy

#### 5.7.2. Boosting Model Capability through Time Series Integration
Weather-related challenges are often unavoidable during satellite imaging, which can hinder the effective performance of index-based analysis. To address this, the current model incorporates a time series chart as an alternative method for accurately assessing surface conditions and selecting the optimal timeframe for model execution. 
In addition to supporting analysis during challenging weather conditions, this time series capability also enables continuous monitoring of cropland throughout the year. This year-round insight can significantly enhance crop monitoring by capturing seasonal trends, detecting anomalies, and supporting timely agricultural decision-making.

Additionally, the model integrates historical rainfall data from gauge stations. This helps identify rain events and supports the model when satellite imagery is unavailable or compromised for specific dates.

This model operates at the OpenStreetMap (OSM) land parcel level, enabling:
 - Geospatial analysis of cropland across various timescales—annually, quarterly, monthly, or within custom date ranges.
 - Independent CSV generation of all indices for different satellite image dates.
 - Direct reference to actual osm_id values, allowing:
     - Monitoring crop rotation patterns
     - Precise geolocation tracking
     - Repeatable and consistent analysis
     - Seamless integration with other geospatial datasets
       
#### Examples
The graphs and tables below illustrate how weather conditions can significantly impact the model's performance. In ideal scenarios—such as clear, dry days—the model yields strong results, as indicated by positive BSI values alongside low NDVI and SAVI, and negative NDSI and NDMI, all of which suggest minimal vegetation and no snow or excess moisture. However, during or after adverse weather events like rain or snow, the model's accuracy can decline. This is reflected by a drop in BSI to negative values and spikes in NDSI and NDMI, signaling surface conditions that obscure accurate interpretation. These examples highlight the importance of selecting appropriate imagery windows to ensure reliable model outputs.

#### Baseline Surface Reflectance in Absence of Weather Interference


<img src="https://github.com/user-attachments/assets/d887f56e-ae29-4499-bd91-c939b4b739df" alt="image" width="700"/>

Figure 8. Baseline surface reflectance in absence of weather Interference

Table 8. Comparing BSI with other indices

<img src="https://github.com/user-attachments/assets/6fc7c9e3-1374-4761-9ec4-a72d92c342dc" alt="image" width="500"/>



#### Surface Reflectance Under Weather Influence

<img src="https://github.com/user-attachments/assets/f5e3eec6-ef25-4527-8719-4aed9d71b579" alt="image" width="700"/>

Figure 9. Surface reflectance under weather Interference

Table 9. Comparing BSI with other indices

<img src="https://github.com/user-attachments/assets/61039ef8-ddce-4163-846d-08d403712cda" alt="image" width="500"/>



## 6. Running the model
More details about this section can be found at ```INSTALL.md```
For more details please visit [Steps To Follow](https://github.com/Cognizant-RDMAI/OpenBareCroplandDetectionModel/blob/main/INSTALL.md#steps-to-follow)

## 7. Model Evaluation
A preliminary validation of the model was undertaken for the Browney catchment using a desktop-based accuracy assessment informed by visual interpretation. High-resolution Google Earth Pro imagery, temporally aligned with the Sentinel-2 acquisition period, was employed to verify model-detected bare cropland areas. Validation was performed by comparing reference points identified as bare cropland in the imagery against corresponding model predictions, with overall accuracy calculated as the proportion of reference points correctly classified by the model. While this initial assessment provides a preliminary indication of model performance, the limited sample size constrains the robustness of the evaluation. Consequently, further validation across additional catchments and at broader spatial scales is planned to enable a more comprehensive assessment of model accuracy.

![image](https://github.com/user-attachments/assets/6eed9b81-d5d5-4dbe-83aa-4b69f768111e)
Figure 10. Bare cropland ground truth references (black points) taken from Google Earh Pro

![image](https://github.com/user-attachments/assets/68b7277b-8798-440e-94cb-ac185fff57a1)
Figure 11. Comparing ground truth references with bare cropland detection (amber)

Table 10. Accuracy assessment
|    | **Bare Cropland** | **Non-Bare Cropland** | **Total** |
|-----------------------|---------------|-------------------|-----------|
| **Actual: Bare Cropland** | 37            | 5                 | 42        |
| **Overall Accuracy**  |               |                   | **88.1%** |



## 8. Conclusions
### Key Findings
 - Effective Discrimination: BSI efectively distinguishes between cropped and non-cropped land surfaces due to its sensitivity to soil reflectance in visible and shortwave infrared bands.
 - Seasonal Applicability: It detects bare cropland accross seasons.
 - Timeseries data of cropland can be generated across years at OSM parcel level.
 - The model, through the CROME crop layer, identifies crop types in bare cropland areas, which may support the assessment of erosion risk within the catchment.
 - Threshold-Based Classification: A well-calibrated threshold on BSI values enables automated detection of bare cropland areas from satellite imagery across seasons.
   
### Strengths
 - Simplicity: BSI is computationally simple, flexible and can be applied to a wide range of satellite data (e.g., Landsat, Sentinel-2 etc.).
 - High Sensitivity to Bare Soil: It captures soil brightness and dryness efectively, making it ideal for detecting exposed soil surfaces.
 - Scalability: Suitable for large-scale monitoring due to its low computational cost and compatibility with cloud-based platforms like Google Earth Engine.
 - Temporal Monitoring: Enables time-series analysis of cropland exposure and land use changes.
 - Flexibility: The model offers a highly adaptable approach—thresholds can be adjusted, new indices can be integrated, and existing ones can be modified. This flexibility makes it suitable for reuse and enhance the applicability across broader scale.
   
### Limitations
 - Soil Moisture and Snow Influence: Wet soils can alter reflectance, leading to underestimation of bare areas.
 - Consistent shadows in imagery can create accuracy issue in some locations.
 - Threshold Sensitivity: Fixed thresholds may not generalize well across regions with different soil types or land management practices.
 - OSM farmland data coverage varies acorss regions in UK, but alternative parcel level datasets can be integrated to support model execution.
 - The CROME crop type dataset is available only for England and may not be available for the most recent years, which may limit its applicability for current assessments. However, alternative crop classification datasets can be integrated to support model execution.
 - Model inputs are multiple GIS datasets which needs to be in valid coordinate system.
 - Successful model execution is guided by a set of prerequisites.
 
## 9. Disclaimer
Our Open Bare Cropland Detection Model is experimental research work developed as part of [River Deep Mountain AI](https://www.cognizant.com/us/en/industries/ocean/rdmai). You are fully responsible for assessing whether its use or distribution is appropriate for your needs. Any risks associated with using or distributing this model and its outputs are solely yours to assume. 

By utilising our Open Bare Cropland Detection Model, you acknowledge and accept the rights and permissions granted under the relevant license. Exercise caution when relying on, publishing, downloading, or otherwise using our Open Bare Cropland Detection Model or any generated outputs.

This model is subject to MIT License and additional disclaimers for this project as set forth for this file.

## 10. References

1. Rikimaru, A., Roy, P.S., and Miyatake, S. (2002). Tropical forest cover density mapping. _Tropical ecology_, 43 (1), 39-47.

2. Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W. (1974, December 10–14). _Monitoring vegetation systems in the Great Plains with ERTS_ [Conference session]. 3rd Earth Resources Technology Satellite-1 Symposium, NASA Goddard Space Flight Center, Washington, DC, United States. https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/19740022614.pdf
 
3. Huete, A. R. (1988). A soil-adjusted vegetation index (SAVI). _Remote Sensing of Environment_, 25(3), 295–309. https://doi.org/10.1016/0034-4257(88)90106-X
 
4. Gao, B. C. (1996). NDWI—A normalized difference water index for remote sensing of vegetation liquid water from space. _Remote Sensing of Environment_, 58(3), 257–266. https://doi.org/10.1016/S0034-4257(96)00067-3

5. Hall, D. K., & Riggs, G. A. (2011). Normalized-Difference Snow Index (NDSI). In V. P. Singh, P. Singh, & U. K. Haritashya (Eds.), _Encyclopedia of snow, ice and glaciers_ (pp. 779–782). Springer. https://doi.org/10.1007/978-90-481-2642-2_376.

6. Mzid, N., Pignatti, S., Huang, W., & Casa, R. (2021). An Analysis of Bare Soil Occurrence in Arable Croplands for Remote Sensing Topsoil Applications. _Remote Sensing_, 13(3), 474. https://doi.org/10.3390/rs13030474.

7. Abdulraheem, M. I., Zhang, W., Li, S., Moshayedi, A. J., Farooque, A. A., & Hu, J. (2023). Advancement of Remote Sensing for Soil Measurements and Applications: A Comprehensive Review. _Sustainability_, 15(21), 15444. https://doi.org/10.3390/su152115444.



