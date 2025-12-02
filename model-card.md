## Model validation using out-of-sample dataset
To ensure the reliability of the bare cropland model, a carefully selected out-of-sample dataset was used for validation. This means the data chosen for testing was not part of the original dataset used to develop or train the model, allowing for an unbiased assessment of its performance on new, unseen conditions.
The validation dataset was specifically designed to test the model sensitivity to satellite sensor reflectance across different soil conditions. To achieve this, four major soil types - Chalky, Clayey, Peat, and Sandy were selected based on classifications from the British Geological Survey, ensuring geopedological diversity. To maintain agricultural relevance, farmland areas were extracted using OpenStreetMap (OSM) land use data, focusing on the farmland tag. A total of 19 UK catchments were chosen to represent a wide range of spatial and environmental variability, supporting robust validation of the model output across diverse landscapes.
Best practice to validate remote sensing outputs is using ground truth reference data for specific mapping periods - and sometimes calibration using ground spectroscopy. However, in the absence of in-situ ground reference data, we have leveraged Google Earth Pro’s historical high-resolution imagery for validation. Visual clues were used to detect bare cropland and non-bare cropland in these images (see two examples in Figure 1), and corresponding coordinates were recorded. The manually identified areas of bare cropland and non-bare cropland were then compared to the result of the model analysis on the Google Earth Engine (GEE) images (Sentinel 2 images) for the same sites and for the same timeframe (varies between ~3 days to ~2 weeks) to assess consistency and accuracy of the model (Figure 2). This multi-layered validation approach ensures that the model is both reliable and adaptable across different soil textures and geographic contexts.

 <img src="./doc/fig11.png" width="550"/>
 Figure 1. Examples of bare and non-bare cropland manually identified from Google Earth Pro’s historical high-resolution imagery (Imagery © Google, Map data © 2022 Google. Source: Google Earth Pro, accessed [Mar, 2022])

 <img src="./doc/fig12.png" width="400"/>
 Figure 2. Flowchart illustration the steps taken in the validation methodology using the out-of-sample dataset

 ### 1. Catchment Selection Criteria
 - Soil Types Included: Chalky, Clayey, Peat, Sandy (Figure 3)
<img src="./doc/fig13.png" width="700"/>
Figure 3. Example visual signatures of distinct bare soil categories in high-resolution imagery (Imagery © Google, Map data © 2022, 2023, 2024, 2025 Google. Source: Google Earth Pro, accessed [Mar, 2022, 2023, 2024, 2025])

 - Farmland Availability Criteria: OSM land use data (tag: farmland)
 - Number of Catchments Selected: 19
 - Catchment with major soil types:  British Geological Survey (BGS) soil type data is used for analysis (Figure 4).

<img src="./doc/fig14.png" width="380"/>
Figure 4.  Selected catchments of different soil types (source: BGS)

### 2. Ground Truth Reference Data Preparation
- **Source:** Google Earth Pro HR images and Sentinel-2 10m Multi Spectral Optical images.
- **Timeframe Alignment:** The validation dataset was developed based on the availability of high-resolution historical imagery in Google Earth Pro, ensuring adequate coverage across all selected catchments (and soil types). To align with typical periods of bare soil exposure, we focused on the UK winter season (December to February) between 2019 and 2025. However, due to limited image availability during winter months in certain catchments, we extended the validation period to include March and April where necessary (Figure 5).
<img src="./doc/fig15.png" width="700"/>
Figure 5. Selected timeframes for out of sample data validation

 - **Sample Size:** In the 19 selected catchments encompassing 36,479 farmland fields, 2,094 fields were manually labelled as bare cropland or non-bare cropland. The labelled fields represent 6% of total farmland fields (Table 1), with the majority of the samples from England (~58%) followed by Scotland (~30%) and Wales (~12%) (Table 2).

Table 1. Distribution of manually labelled farm fields across catchments
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>
<img src="./doc/table 9.png" width="480"/>

Table 2. Distribution of manually labelled farm fields across catchments
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>
<img src="./doc/table 10.png" width="550"/>

**Reference Classes:** These are the categories used to label the dataset:
   - **Bare Cropland:** Agricultural fields that are not covered by vegetation — typically after harvest or during land preparation.
   - **Non-Bare Cropland:** Fields that have visible vegetation cover — crops growing or residue left after harvest.

**Performance Metrics Computed:**
1. Confusion Matrix A table showing the counts of
   - True Positives (TP): Correctly predicted bare cropland
   - True Negatives (TN): Correctly predicted non-bare cropland
   - False Positives (FP): Non-bare cropland predicted as bare
   - False Negatives (FN): Bare cropland predicted as non-bare cropland
2.	Overall Accuracy: Measures the proportion of correct predictions out of all predictions.
3.	Precision: Indicates how many predicted bare cropland pixels were actually bare.
4.	Recall: Measures how many actual bare cropland pixels were correctly identified
5.	F1 Score: A harmonic mean of precision and recall — useful to show balance between classes

### 3. Performance Metrics at Catchment level
Table 3. Confusion matrix across selected catchments in Great Britain
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>
<img src="./doc/table 11.png" width="550"/>

Table 4. Performance metrics across selected catchments in UK
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>
<img src="./doc/table 12.png" width="550"/>


<img src="./doc/fig16.png" width="800"/>

Figure 6. Recall and F1 score comparison across catchments

#### Catchment-Level Insights
##### High Performing Catchments (Consistent Across Thresholds)
As per the table 3, Table 4 and Figure 6
 - Gypsey Race, Itchen, and South Level Cutoff show high recall and F1 scores across both BSI thresholds (>0 & >0.1), suggesting strong model confidence and balance.
 - Cam Rhee and Granta also maintains high performance, with minimal drop in recall at the higher threshold.

##### Catchments Sensitive to Threshold Change
 - Glaze and Dwyryd show a significant drop in recall at Threshold > 0.1, indicating that the model becomes more conservative and misses more true positives.
 - Salwarpe River and Ely also show reduced recall and F1 scores at the higher threshold, suggesting these areas may require threshold tuning or additional features.
 - However, we cannot conclusively determine why certain catchments perform less effectively, as model sensitivity may be influenced by complex interactions between land cover, soil type, topography, and seasonal variability.

### 4. Performance Metrics and Threshold Sensitivity to Soil Category
Table 5. Confusion matrix across selected BGS Soil types in UK
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>
<img src="./doc/table 14.png" width="550"/>

Table 6. Confusion matrix across selected BGS Soil types in UK
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>

<img src="./doc/table 15.png" width="550"/>

Figure 7. Recall and F1 score comparison across different soil types
<img src="./doc/fig17.png" width="700"/>

#### Key Insights
As per the Table 5, Table 6 and Figure 7
##### Chalky Soil
 - Accuracy consistently high across all metrics and thresholds.
 - Minimal change between thresholds, indicating stable model performance.
##### Clayey Soil
 - Slight drop in recall and F1 score at Threshold > 0.1.
 - Precision remains very high, suggesting fewer false positives.
##### Peat Soil
 - Recall improves significantly at Threshold > 0.1 (from 0.88 to 0.99).
 - Precision drops, indicating more false positives at the higher threshold.
##### Sandy Soil
 - Most sensitive to BSI threshold change.
 - Recall drops from 0.92 to 0.71, and F1 score from 0.92 to 0.83.
 - Indicates potential need for threshold tuning or additional features.

### 5. Overall Performance Summary
The Bare cropland model demonstrated strong and consistent performance across different regions and soil types. Validation was conducted using two BSI threshold levels greater than 0 and greater than 0.1 to assess sensitivity and robustness.
#### At threshold greater than 0, the model achieved:
High overall accuracy, precision and recall (0.94), indicating reliable detection of bare soil areas with minimal false positives or negatives (Table 7).

Table 7. Overall Performance metrics and threshold sensitivity
<body lang=EN-IN style='tab-interval:30.0pt;word-wrap:break-word'>
<!--StartFragment-->

<div align=left>

<img src="./doc/table 17.png" width="550"/>

F1-Score remained balanced across all soil types, with Chalky Soil showing the highest recall (0.97).
At threshold greater than 0.1, the model maintained high precision (0.99 overall), but recall dropped to 0.84, reflecting a more conservative detection approach. This trade-off resulted in slightly lower F1-Scores, especially in Sandy Soil (0.83) areas, where image availability and seasonal variability may have influenced performance.

The model’s sensitivity to surface moisture and snow cover, as documented in the model specification, is an important consideration. These environmental factors can influence spectral reflectance and may lead to misclassification, particularly during winter months or in areas with persistent cloud cover or snow.

#### Soil specific considerations:
 - Chalky Soil consistently showed strong performance across all metrics.
 - Peat Soil had the highest recall at threshold >0.1 (0.99), suggesting good model sensitivity in organic-rich areas.
 - Sandy Soil showed slightly lower recall and F1-scores, indicating potential challenges in spectral differentiation.

