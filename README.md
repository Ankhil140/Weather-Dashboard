# Climate Dashboard using Machine Learning

This repository contains a full-stack, premium web application that implements a machine learning model to predict temperatures using historical climate data. Initially based on the "Predict Weather with Machine Learning" tutorial, it has been expanded into a live Interactive Dashboard deployed on Vercel.

## Project Overview

The project demonstrates an end-to-end data science and full-stack workflow:
1. **Machine Learning**: An exploratory Jupyter Notebook (`predict_weather.ipynb`) that cleans the `Temperatures.csv` dataset and trains a Random Forest Regressor to predict the `LandAndOceanAverageTemperature`.
2. **Serverless API**: A Python Flask backend (`/api`) that exposes live predictions and leverages `@vercel/python` for scalable deployment.
3. **Live Dashboard**: A beautiful Vite/React frontend designed with premium Glassmorphism aesthetics that consumes both the ML predictions and live REST APIs (Open-Meteo) to provide real-time weather tracking.

## Tools & Libraries Used

* **Frontend**: React 19, Vite, Recharts, Lucide-React, Vanilla Custom CSS
* **Backend**: Python 3, Flask, Pandas, Scikit-Learn, Joblib
* **APIs**: Open-Meteo (Free Geocoding & Live Weather)

## Model Performance

*   **Baseline MAE**: 2.04 degrees Fahrenheit
*   **Model MAE**: 0.25 degrees Fahrenheit
*   **Model Accuracy**: ~99.58%

The Random Forest Regressor significantly outperforms the baseline moving average model, achieving high accuracy in predicting terrestrial and oceanic temperatures.

## Deployment (Vercel)

This repository is structured as a Vercel Monorepo. 
To launch it online:
1. Import this repository to your [Vercel](https://vercel.com/) dashboard.
2. Vercel will automatically build the React frontend and deploy the `/api` directory as serverless backend functions.

## Local Development

To run the application locally:
```bash
# Terminal 1: Frontend
npm install
npm run dev

# Terminal 2: Backend API
cd api
pip install -r requirements.txt
python index.py
```
