import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import make_pipeline
import joblib

def c_to_f(celsius_temp):
    return (celsius_temp * 9/5) + 32

def train_and_export():
    print("Loading data...")
    # Script runs inside the api/ folder with the csv
    csv_path = os.path.join(os.path.dirname(__file__), 'Temperatures.csv')
    df = pd.read_csv(csv_path)

    print("Preprocessing data...")
    cols_to_drop = [col for col in df.columns if 'Uncertainty' in col]
    df.drop(columns=cols_to_drop, inplace=True)

    temp_cols = [col for col in df.columns if 'Temperature' in col]
    for col in temp_cols:
        df[col] = df[col].apply(c_to_f)

    df['dt'] = pd.to_datetime(df['dt'])
    df['Year'] = df['dt'].dt.year
    df['Month'] = df['dt'].dt.month

    df = df[df['Year'] >= 1850]
    df.dropna(inplace=True)

    print("Training model...")
    target = 'LandAndOceanAverageTemperature'
    y = df[target]
    X = df[['LandAverageTemperature', 'LandMaxTemperature', 'LandMinTemperature']]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    model = make_pipeline(
        RandomForestRegressor(random_state=42)
    )
    model.fit(X_train, y_train)

    print("Exporting model...")
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(model, model_path)
    
    print(f"Model successfully saved to {model_path}!")

if __name__ == '__main__':
    train_and_export()
