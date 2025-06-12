# Open Bare Cropland Detection Model

## 1. Introduction
Water pollution continues to pose a serious global threat, impacting rivers, lakes, estuaries, and coastal ecosystems. A major contributor to this issue is non-point source pollution — sometimes referred to as diffuse pollution. Non-point sources of water pollution are those that don’t originate from a single, discrete source, but are rather contaminants introduced to the watercourse over a large area. As such, non-point pollution is much more difficult to identify and manage compared to point sources. Agricultural runoff is a key component of this type of pollution. During certain periods in the farming cycle, such as post-harvest or pre-planting, croplands are often left bare, making them particularly vulnerable to erosion and the leaching of nutrients and agrochemicals.

These exposed soils, especially during rainy seasons, can significantly accelerate the transport of sediments, fertilizers, and pesticides into nearby water bodies. Monitoring such bare cropland areas is therefore essential for identifying potential pollution hotspots and informing mitigation strategies.

To support this effort, an Open Bare Cropland Detection Model has been developed, leveraging satellite-derived spectral indicators to evaluate bare soil exposure, vegetation cover, and surface conditions such as snow and moisture presence. Combined with weather data, the model enables accurate monitoring of surface dynamics throughout the seasons. This enhances the ability to track fallow periods, detect land degradation, and inform sustainable land and water resource management strategies.

### 1.1. Motivation
Bare cropland detection is useful for identifying water pollution sources because these areas can contribute significantly to runoff, carrying pollutants like fertilisers, pesticides, and sediment into nearby water bodies. Identifying bare cropland helps in pinpointing potential pollution hotspots and implementing targeted measures to mitigate water contamination.

### 1.2. RDMAI Overview
River Deep Mountain AI (RDMAI) is an innovation project funded by the Ofwat Innovation Fund working collaboratively to develop open-source AI/ML models that can inform effective actions to tackle waterbody pollution.  
  
The project consists of 6 core partners: Northumbrian Water, Cognizant Ocean, Xylem Inc, Water Research Centre Limited, The Rivers Trust and ADAS. The project is further supported by 6 water companies across the United Kingdom and Ireland. 

### 1.3.	Purpose and Functionality
The primary purpose of this project is to develop a remote sensing-based model capable of detecting and monitoring bare cropland surfaces across agricultural landscapes using high-resolution satellite imagery. Bare croplands are critical indicators of land exposure and potential environmental vulnerability. Mapping their extent supports a range of downstream applications such as:

 - Soil erosion risk assessment
 - Non-point source pollution monitoring and mitigation
 - Agricultural land management and planning
 - Crop rotation and fallow land analysis
 - Dynamic land use mapping and environmental reporting

The model is designed to function as a part of a fully scalable geospatial pipeline, it can be applied across catchments. It has the following core functions:

**Identification:** Identify bare cropland areas using spectral analysis of satellite imagery, primarily leveraging the Bare Soil Index (BSI) alongside other vegetation indices such as NDVI and SAVI.

**Classification:** Differentiate bare soil from vegetated or non-agricultural surfaces using threshold-based classification of spectral indices, ensuring consistent and   objective interpretation.

**Integration:** Export results as GeoTIFF or Shape files compatible with GIS platforms like QGIS, ArcGIS, and Google Earth Engine.

Unlike traditional field-based surveys or commercial licensed land use datasets — which are often infrequent, costly, and limited in resolution—this Open Bare Cropland Model offers a dynamic, cost-effective, and repeatable alternative. By utilizing open-access satellite imagery at 10m spatial resolultion, it empowers stakeholders with timely insights into land surface conditions, enhancing environmental stewardship and agricultural decision-making.

## 2. Installation Instructions
To get started with the Bare cropland detection model:
### 2.1 Prerequisites
 - The [Open Bare Cropland Detection Model](https://github.com/Cognizant-RDMAI/BB2A-Identification-of-bare-cropland-from-satellite-images) is developed using cloud-based Google Earth Engine (GEE) platform and code is written in JavaScript. To run the model, it doesn’t necessarily require installing Google Earth Engine locally, but it requires a valid license and account to run the code.
 - The model is optimized for catchment-level analysis due to its computational efficiency, enabling faster pixel-level processing. However, Google Earth Engine imposes pixel processing limits depending on the license type. For standard (free) users, batch tasks are typically limited to processing around 1 billion pixels per task, with a maximum of 2 concurrent batch tasks. Commercial users may access higher limits depending on their pricing plan and quota requests.
 - GEE FeatureCollection to the Console using print(), can only visualize the first 5000 records. This is a hard limit for visualization purposes to all license categories. However, you can still process or export the full dataset using Export.table.toDrive() or similar functions.
### 2.2. Clone the repository
First, clone this project to your local machine or cloud environment
```https://github.com/Cognizant-RDMAI/OpenBareCroplandDetectionModel```. This will download all model files including scripts.
### 2.3. Install dependencies
A valid GEE license and account to run the code.
### 2.4. Data Sources and Preprocessing
#### 2.4.1. Satellite Data: 
Sentinel-2 imagery is available in several processing levels. The three most commonly used data products are Top of Atmosphere (TOA) Reflectance and Bottom of Atmosphere (BOA) like Surface Reflectance (SR), and Harmonized Surface Reflectance (Harmonized SR or HLS). In this work we have utlised Harmonized SR imagery for model development.
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

#### 2.4.2. Creating Composite image
This method is commonly used in remote sensing to reduce noise (e.g., clouds, shadows) and produce a cleaner, more representative image.


<p align="left">
  <img src="https://github.com/user-attachments/assets/5e7880d5-3636-483a-97c4-d7996a206d82" width="400"/>
</p>
Figure 1. Illustration of creating satellite image composite


The Figure 1 demonstrates how the satellite image composite is being generated. In the example above, each subplot shows a 3×3 image. The composite image (bottom right) is created by taking the median value at each pixel location across the three input images. The Table 2 highlights the advantages of using composite images over raw images.

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

In Google Earth Engine (GEE), composite images have been generated for agricultural periods i.e. Winter and Summer to capture seasonal variations in croplands.

**Temporal Scope:** To effectively capture seasonal variations in land cover, imagery was carefully selected to represent key agricultural periods: winter to early spring (November/December to February/March) and mid-summer (June to August). This temporal segmentation ensures that the analysis reflects the dynamic nature of cropland throughout the agricultural cycle.

**Cloud Masking:** The current methodology incorporates a cloud cover threshold by selecting Sentinel-2 imagery with less than 20% cloud cover. This approach ensures higher data quality by reducing atmospheric noise and occlusion, which are common challenges in optical satellite imagery. By minimizing cloud interference, the method enhances the accuracy of surface reflectance measurements and supports more reliable image classification.

### 2.5. Input data preparation
#### 2.5.1. Crop mask
This model requires a crop mask to run the model effectively and avoiding misclassification of other land use classes. In this work, we have opted to use the openly available farmland boundary data from OpenStreetMap (OSM) land cover data to isolate agricultural areas for analysis. This data, which includes polygons tagged as fclass = farmland, is extracted and converted into a vector layer (e.g., shapefile). In GEE, it is imported as a FeatureCollection and used to clip satellite imagery or mask out non-agricultural land, ensuring that remote sensing models focus only on cropland.

<img width="511" alt="image" src="https://github.com/user-attachments/assets/c1b16e48-f081-44de-ad14-5a188162b8d3" />

Figure 2. OSM farmland layer

**Source:** Download Open Street Map (OSM) Landuse data from https://download.geofabrik.de/europe/united-kingdom.html
#### Limitations: 
While OSM is a valuable open-source platform maintained by a global community of contributors, it is important to acknowledge the following limitations, such as:
 - **Data Completeness:** OSM coverage is generally more comprehensive in urban and semi-urban areas. In rural regions, including agricultural zones, the completeness of farmland boundaries may vary depending on contributor activity.
 - **Positional Accuracy:** Studies have shown that OSM features in the UK typically have good positional accuracy (within a few meters), but this can vary locally.
 - **Update Frequency:** OSM data is updated continuously by volunteers, but there is no guaranteed schedule for updates or quality control.
#### 2.5.2. Integrating OSM Crop mask and CROME datasets
The CROME dataset uses a hexagonal grid system to divide the landscape into uniform cells. This data has been enhanced by adding crop description. This layer has been combined with OSM crop mask layer to enhance the mask information.

<img width="500" alt="image" src="https://github.com/user-attachments/assets/5cb16ea0-0c4a-4010-80ea-e97466540750" /> 

Figure 3. CROME dataset integrated with OSM farmland layer

**Source:** Download CROME crop type data from https://environment.data.gov.uk/explore/f0f54bc1-b77a-42c8-b601-2f4aaf4dd851?download=true

#### 2.5.3. Incorporating Rainfall Data
Historical rainfall data was downloaded from DEFRA's Hydrology Explorer for gauge stations located within each catchment. This ground-based data was then used in Google Earth Engine to compare with satellite-derived moisture indices like NDMI, enabling a more robust assessment of soil moisture variability and hydrological conditions. The current approach also applicable to integrate any other type of rainfall dataset as well.

![image](https://github.com/user-attachments/assets/36184bec-bb26-45e2-938f-585beebdcef4)

Figure 4. Rainfall data

**Source:** Download catchment level rainfall data (daily in .CSV) of each gauge stations required for analysis from https://environment.data.gov.uk/hydrology/explore.

 #### 2.5.4. GEE asset creation
 - Download Catchment data from https://environment.data.gov.uk/catchment-planning/ and add into GEE asset.
 - Add the crop mask asset contains CROME information into GEE (to be prepared in below manner).
 ```
 - Extract farmland (fclass = 'farmland') from OSM landuse repository using QGIS/ArcGIS/programatically.
 - Clip the farmland layer for targetted catchment.
 - Clip CROME crop type data for targetted catchment.
 - Dissolve CROME crop classes spatially based on crop type and create centroid geometry from each class. This can be done using geospatial tool like QGIS/ArcGIS/programatically.
 - Intersect the farmland and crop point dataset together to create a new Crop mask includes crop type. Add this layer as an crop mask asset in GEE.
```
### 2.6. Use of Remote Sensing Indices
This model leverages quantitative spectral indices like Normalized Difference Vegetation Index (NDVI), Soil Adjusted Vegetation Index (SAVI), and Bare Soil Index (BSI) provide quantitative, standardized metrics that remove ambiguity and interpretable outputs for land surface analysis. Spectral characteristics of BSI, NDVI, and SAVI provides a powerful way to understand the biophysical characteristics of the Earth's surface, especially in agricultural or semi-natural landscapes. Based on analysis of all such indices and their performance we have considered BSI index as key index for Bare cropland detection. Table 3 presents a summary of key remote sensing indices used in this study. The threshold values were selected based on a review of relevant literature to ensure consistency with established practices in cropland and land cover analysis.

Table 3. Remote Sensing Indices

| **Index** | **Formula**     | **Threshold** | **Purpose** | **Reference** |
|----------|-----------------|---------------|-------------|---------------|
| **BSI** | ((SWIR + RED) -<br>(NIR + BLUE)) /<br>((SWIR + RED) +<br>(NIR + BLUE))     | > 0 (Bare soil) | Exposed soil detection | Mzid et al., 2021 |
| **NDVI** | (NIR - RED) /<br>(NIR + RED)     | > 0.4 (Vegetation) | Vegetation health | Rouse et al., 1974 |
| **SAVI** | ((NIR - RED) /<br>(NIR + RED + L)) ×<br>(1 + L)     | > 0.4 (Vegetation) | Soil-adjusted vegetation | Huete, 1988 |
| **NDMI** | (NIR - SWIR) /<br>(NIR + SWIR)     | > 0.4 (No stress) | Moisture in vegetation | Gao, 1996 |
| **NDSI** | (GREEN - SWIR1) /<br>(GREEN + SWIR1)     | > 0.4 (Snow) | Snow detection | Hall & Riggs, 2011 |

Where,
 - **GREEN** = Reflectance in the green band
 - **RED** = Reflectance in the red band
 - **NIR (Near Infra-Red)** = Reflectance in the near-infrared band
 - **SWIR (Short Wave Infra-Red)** Reflectance in the short wave-infrared band.
 - **L** = Soil brightness correction factor (commonly L = 0.5)

#### Spectral Profiles for Surface Feature Analysis
Spectral reflectance varies across the Green, Red, NIR, and SWIR bands depending on surface conditions. The following examples are taken from the Browney Catchment, an area predominantly used for agriculture. Histograms (Figure 5) were generated for both the summer and winter seasons of 2024 to analyze surface conditions in addition to index-based assessments.

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

Table 4 summarizes the seasonal variation in surface reflectance across key spectral bands, comparing summer and winter conditions. This comparison highlights how vegetation activity, soil moisture, and surface cover differ between seasons—insights that are essential for understanding land surface dynamics in cropland areas. Additionally, it supports index-based analysis by providing context for how spectral responses shift seasonally.

#### Normalized Vegetation Index (NDVI)
NDVI values provide insight into vegetation health and density. High NDVI values (greater than 0.6) typically indicate dense, healthy vegetation such as forests or crops at peak growth. Moderate values, ranging from 0.3 to 0.5, suggest sparse or stressed vegetation. In contrast, low or negative NDVI values (below 0.3) are generally associated with bare soil, built-up areas, or water bodies.

#### Soil Adjusted Vegetation Index (SAVI)
SAVI values follow a similar interpretive pattern to NDVI but are specifically designed to be less sensitive to soil reflectance. This makes SAVI particularly useful in semi-arid or sparsely vegetated regions, where it provides a more stable and reliable vegetation signal compared to NDVI. A SAVI range between 0.2 and 0.3 represents a transitional zone, often associated with sparse or emerging vegetation. Values above 0.3 suggest increasing vegetation density, reflecting healthier or more developed plant cover.

#### Why NDVI and SAVI alone are not enough to detect bare cropland?
Both NDVI and SAVI are Near Infra-Red (NIR) based vegetation indices, meaning they primarily measure the presence and vigour of vegetation by comparing the reflectance in the NIR and Red bands. However, bare soil can sometimes reflect moderate NIR, especially if it's dry or has light-coloured minerals.
Sparse vegetation or crop residues can confuse NDVI/SAVI, leading to false positives for vegetation. These indices are less sensitive to soil characteristics, such as moisture, texture, or organic content.

#### Bare Soil Index (BSI) as Key Index
With respect to some studies related to bare land mapping using multispectral images, Bare Soil Index (BSI) has achieved better accuracy. Unlike indices that rely solely on NIR and Red bands, BSI incorporates multiple spectral bands to more effectively isolate bare soil. To support this, Table 5 illustrates the typical Short-Wave Infrared (SWIR) reflectance patterns for different land cover types. These patterns help explain why SWIR is particularly useful in distinguishing dry bare soil from moist soil, vegetation, and water — making it a valuable component in index-based analysis such as BSI.

<body lang=EN-IN style='tab-interval:36.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>

Table 5. Understanding SWIR pattern for different land cover
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

Based on image interpretation and spectral characteristics, BSI threshold has been decided. Table 6 summarizes the interpretation of BSI thresholds, providing guidance on how different value ranges correspond to varying degrees of bare soil presence.

Table 6. Interpreting BSI thresholds
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


This threshold is also useful for:
 - A binary classification (bare vs. non-bare).
 - Building a mask for bare soil detection.
 - Working with large-scale monitoring and need a simple rule.
These indices are often used as inputs for machine learning models, classification algorithms, or threshold-based decision systems.

#### Examples
A demonstration is shown in the Figure 6, where the below image is the farmlands (Browney catchment, UK) false colour composite of three near infra-red, red and green bands from Sentinel 2 harmonized surface reflectance image and the image to its below is the extracted bare cropland in summer (blue areas) and winter (amber areas).
<img src="https://github.com/user-attachments/assets/29e5d017-00b6-4443-bea7-2b2b60d82a4b" width="800"/>

Figure 6. Detected winter and summer bare cropland

### 2.7. Operational Challenges and Adaptive Solutions
Weather events (snow and rainfall) in the United Kingdom, can significantly alter surface reflectance captured by satellite sensors, often introducing anomalies or biases in spectral indices used for vegetation and soil analysis. 
To address this, the model incorporates a robust feature that utilizes spectral index time series to differentiate between bare soil and surfaces influenced by weather conditions. By examining the temporal patterns of multiple indices—NDVI, SAVI, BSI, NDMI, and NDSI—the model can accurately infer surface conditions with high sensitivity over time, ensuring more reliable analysis even under variable environmental conditions.

#### 2.7.1. Weather Effects on Detection Accuracy
The below Figure 7 (left image) demonstrated the impact of snow cover in the Browney Catchment (UK) during January 2023 on model output'. The image on the right shows the improvement in model predictions just a month later during the snow-free period.

<img src="https://github.com/user-attachments/assets/a90a8d26-920a-412b-8cee-96013f87a816" width="800"/>

Figure 7. Weather effects on detection accuracy

#### 2.7.2. Boosting Model Capability through Time Series Integration
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
The garphs and tables below illustrate how weather conditions can significantly impact the model's performance. In ideal scenarios—such as clear, dry days—the model yields strong results, as indicated by positive BSI values (the arrow in Figure 8 and the red bounding box around the BSI column in Table 7) alongside low NDVI and SAVI, and negative NDSI and NDMI, all of which suggest minimal vegetation and no snow or excess moisture. However, during or after adverse weather events like rain or snow, the model's accuracy can decline. This is reflected by a drop in BSI to negative values and spikes in NDSI and NDMI (the arrows in Figure 9 and the red bounding boxes around the BSI and NDSI columns in Table 8), signaling surface conditions that obscure accurate interpretation. These examples highlight the importance of selecting appropriate imagery windows to ensure reliable model outputs.

#### Baseline Surface Reflectance in Absence of Weather Interference


<img src="https://github.com/user-attachments/assets/d887f56e-ae29-4499-bd91-c939b4b739df" alt="image" width="700"/>

Figure 8. Baseline surface reflectance in absence of weather Interference

Table 7. Comparing BSI with other indices

<img src="https://github.com/user-attachments/assets/6fc7c9e3-1374-4761-9ec4-a72d92c342dc" alt="image" width="500"/>



#### Surface Reflectance Under Weather Influence

<img src="https://github.com/user-attachments/assets/f5e3eec6-ef25-4527-8719-4aed9d71b579" alt="image" width="700"/>

Figure 9. Surface reflectance under weather Interference

Table 8. Comparing BSI with other indices

<img src="https://github.com/user-attachments/assets/61039ef8-ddce-4163-846d-08d403712cda" alt="image" width="500"/>



## 3. Running the model
More details about this section can be found at ```INSTALL.md```
For more details please visit [Steps To Follow](https://github.com/Cognizant-RDMAI/OpenBareCroplandDetectionModel/blob/main/INSTALL.md#steps-to-follow)

## 4. Model Evaluation
A preliminary validation of the model was undertaken for the Browney catchment using a desktop-based accuracy assessment informed by visual interpretation. High-resolution Google Earth Pro imagery, temporally aligned with the Sentinel-2 acquisition period, was employed to verify model-detected bare cropland areas. Validation was performed by comparing reference points (Figure 10) identified as bare cropland in the imagery against corresponding model predictions (Figure 11), with overall accuracy (Table 9) calculated as the proportion of reference points correctly classified by the model. While this initial assessment provides a preliminary indication of model performance, the limited sample size constrains the robustness of the evaluation. Consequently, further validation across additional catchments and at broader spatial scales is planned to enable a more comprehensive assessment of model accuracy.

![image](https://github.com/user-attachments/assets/6eed9b81-d5d5-4dbe-83aa-4b69f768111e)
Figure 10. Bare cropland ground truth references (black points) taken from Google Earh Pro

![image](https://github.com/user-attachments/assets/68b7277b-8798-440e-94cb-ac185fff57a1)
Figure 11. Comparing ground truth references with bare cropland detection (amber)

Table 9. Accuracy assessment
|    | **Bare Cropland** | **Non-Bare Cropland** | **Total** |
|-----------------------|---------------|-------------------|-----------|
| **Actual: Bare Cropland** | 37            | 5                 | 42        |
| **Overall Accuracy**  |               |                   | **88.1%** |



## 5. Conclusions
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

## 6. Disclaimer
River Deep Mountain AI (“RDMAI”) is run by a collection of UK water companies and their technology partners. The entities currently participating in RDMAI are listed at the end of this section and they are collectively referred to in these terms as the “consortium”.

This section provides additional context and usage guidance specific to the artificial intelligence models and / or software (the “**Software**”) distributed under the MIT License. It does not modify or override the terms of the MIT License.  In the event of any conflict between this section and the terms of the MIT licence, the terms of the MIT licence shall take precedence.
#### 1. Research and Development Status
The Software has been created as part of a research and development project and reflects a point-in-time snapshot of an evolving project. It is provided without any warranty, representation or commitment of any kind including with regards to title, non-infringement, accuracy, completeness, or performance. The Software is for information purposes only and it is not: (1) intended for production use unless the user accepts full liability for its use of the Software and independently validates that the Software is appropriate for its required use; and / or (2) intended to be the basis of making any decision without independent validation. No party, including any member of the development consortium, is obligated to provide updates, maintenance, or support in relation to the Software and / or any associated documentation.
#### 2. Software Knowledge Cutoff
The Software was trained on publicly available data up to April 2025. It may not reflect current scientific understanding, environmental conditions, or regulatory standards. Users are solely responsible for verifying the accuracy, timeliness, and applicability of any outputs.
#### 3. Experimental and Generative Nature
The Software may exhibit limitations, including but not limited to:
 - Inaccurate, incomplete, or misleading outputs; 
 - Embedded biases and / or assumptions in training data;
 - Non-deterministic and / or unexpected behaviour;
 - Limited transparency in model logic or decision-making
 
Users must critically evaluate and independently validate all outputs and exercise independent scientific, legal, and technical judgment when using the Software and / or any outputs. The Software is not a substitute for professional expertise and / or regulatory compliance.
 
#### 4. Usage Considerations
 
 - Bias and Fairness: The Software may reflect biases present in its training data. Users are responsible for identifying and mitigating such biases in their applications.
 - Ethical and Lawful Use: The Software is intended solely for lawful, ethical, and development purposes. It must not be used in any way that could result in harm to individuals, communities, and / or the environment, or in any way that violates applicable laws and / or regulations.
 - Data Privacy: The Software was trained on publicly available datasets. Users must ensure compliance with all applicable data privacy laws and licensing terms when using the Software in any way.
 - Environmental and Regulatory Risk: Users are not permitted to use the Software for environmental monitoring, regulatory reporting, or decision making in relation to public health, public policy and / or commercial matters. Any such use is in violation of these terms and at the user’s sole risk and discretion.
 
#### 5. No Liability
 
This section is intended to clarify, and not to limit or modify, the disclaimer of warranties and limitation of liability already provided under the MIT License.
 
To the extent permitted by applicable law, users acknowledge and agree that:
 - The Software is not permitted for use in environmental monitoring, regulatory compliance, or decision making in relation to public health, public policy and / or commercial matters.
 - Any use of the Software in such contexts is in violation of these terms and undertaken entirely at the user’s own risk.
 - The development consortium and all consortium members, contributors and their affiliates expressly disclaim any responsibility or liability for any use of the Software including (but not limited to):
   - Environmental, ecological, public health, public policy or commercial outcomes
   - Regulatory and / or legal compliance failures
   - Misinterpretation, misuse, or reliance on the Software’s outputs
   - Any direct, indirect, incidental, or consequential damages arising from use of the Software including (but not limited to) any (1) loss of profit, (2) loss of use, (3) loss of income, (4) loss of production or accruals, (5) loss of anticipated savings, (6) loss of business or contracts, (7) loss or depletion of goodwill, (8) loss of goods, (9) loss or corruption of data, information, or software, (10) pure economic loss, or (11) wasted expenditure resulting from use of the Software —whether arising in contract, tort, or otherwise, even if foreseeable . 
 
Users assume full responsibility for their use of the Software, validating the Software’s outputs and for any decisions and / or actions taken based on their use of the Software and / or its outputs.

#### 6. Consortium Members  
 
1. Anglian Water Services Limited 
2. Southwest Water Limited 
3. Northern Ireland Water 
4. Wessex Water Limited
5. The Rivers Trust
6. RSK ADAS Limited
7. Water Research Centre Limited
8. Xylem
9. Northumbrian Water Limited
10. Cognizant Worldwide Limited

## 7. References

1. Rikimaru, A., Roy, P.S., and Miyatake, S. (2002). Tropical forest cover density mapping. _Tropical ecology_, 43 (1), 39-47.

2. Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W. (1974, December 10–14). _Monitoring vegetation systems in the Great Plains with ERTS_ [Conference session]. 3rd Earth Resources Technology Satellite-1 Symposium, NASA Goddard Space Flight Center, Washington, DC, United States. https://ntrs.nasa.gov/archive/nasa/casi.ntrs.nasa.gov/19740022614.pdf
 
3. Huete, A. R. (1988). A soil-adjusted vegetation index (SAVI). _Remote Sensing of Environment_, 25(3), 295–309. https://doi.org/10.1016/0034-4257(88)90106-X
 
4. Gao, B. C. (1996). NDWI—A normalized difference water index for remote sensing of vegetation liquid water from space. _Remote Sensing of Environment_, 58(3), 257–266. https://doi.org/10.1016/S0034-4257(96)00067-3

5. Hall, D. K., & Riggs, G. A. (2011). Normalized-Difference Snow Index (NDSI). In V. P. Singh, P. Singh, & U. K. Haritashya (Eds.), _Encyclopedia of snow, ice and glaciers_ (pp. 779–782). Springer. https://doi.org/10.1007/978-90-481-2642-2_376.

6. Mzid, N., Pignatti, S., Huang, W., & Casa, R. (2021). An Analysis of Bare Soil Occurrence in Arable Croplands for Remote Sensing Topsoil Applications. _Remote Sensing_, 13(3), 474. https://doi.org/10.3390/rs13030474.

7. Abdulraheem, M. I., Zhang, W., Li, S., Moshayedi, A. J., Farooque, A. A., & Hu, J. (2023). Advancement of Remote Sensing for Soil Measurements and Applications: A Comprehensive Review. _Sustainability_, 15(21), 15444. https://doi.org/10.3390/su152115444.



