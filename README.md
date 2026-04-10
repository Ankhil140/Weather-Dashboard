# Predicting Weather with Machine Learning

This repository contains a comprehensive Jupyter Notebook that implements a machine learning model to predict global temperatures using historical climate data. It is a recreation of the "Predict Weather with Machine Learning" tutorial, optimized for learning and demonstration purposes.

## Project Overview

The project demonstrates an end-to-end data science workflow:
1. **Data Loading & Exploration**: Ingestion of `GlobalTemperatures.csv` and exploratory data analysis.
2. **Data Wrangling**: Cleaning the dataset by dropping high cardinality columns, handling N/A values, parsing dates, and converting temperatures from Celsius to Fahrenheit.
3. **Visualization**: Generating a correlation heatmap using Seaborn to identify relevant features.
4. **Modeling**: Training a Random Forest Regressor to predict the `LandAndOceanAverageTemperature`.
5. **Evaluation**: Evaluating the model against a baseline using Mean Absolute Error (MAE) and Mean Absolute Percentage Error (MAPE). 

## Tools & Libraries Used

* **Python 3**
* **Pandas & NumPy** for data manipulation
* **Seaborn & Matplotlib** for data visualization
* **Scikit-Learn** for machine learning (RandomForestRegressor, Pipelines, Train-Test Split)

## Model Performance

*   **Baseline MAE**: 2.04 degrees Fahrenheit
*   **Model MAE**: 0.25 degrees Fahrenheit
*   **Model Accuracy**: ~99.58%

The Random Forest Regressor significantly outperforms the baseline moving average model, achieving high accuracy in predicting terrestrial and oceanic temperatures.

## Usage

To run the notebook locally, ensure you have Jupyter and the required dependencies installed:

```bash
pip install pandas numpy seaborn matplotlib scikit-learn
jupyter notebook predict_weather.ipynb
```

## Dataset
The project expects `GlobalTemperatures.csv` in the root repository directory. This dataset consists of global average land and ocean temperature measurements dating back to 1750.
