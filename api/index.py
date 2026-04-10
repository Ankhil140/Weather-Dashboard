import os
import pandas as pd
import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def c_to_f(celsius_temp):
    return (celsius_temp * 9/5) + 32

def load_data():
    csv_path = os.path.join(os.path.dirname(__file__), 'GlobalTemperatures.csv')
    df = pd.read_csv(csv_path)
    
    # Process
    cols_to_drop = [col for col in df.columns if 'Uncertainty' in col]
    df.drop(columns=cols_to_drop, inplace=True)
    temp_cols = [col for col in df.columns if 'Temperature' in col]
    for col in temp_cols:
        df[col] = df[col].apply(c_to_f)
    df['dt'] = pd.to_datetime(df['dt'])
    df['Year'] = df['dt'].dt.year
    df = df[df['Year'] >= 1850]
    df.dropna(inplace=True)
    
    return df

@app.route('/api/data', methods=['GET'])
def get_historical_data():
    try:
        df = load_data()
        # Group by year to get average yearly temperatures to reduce payload size
        yearly = df.groupby('Year').mean(numeric_only=True).reset_index()
        # Return the last 50 years for a nice chart
        recent = yearly.tail(50).to_dict(orient='records')
        
        # Calculate current average from last year for KPI
        latest_avg = recent[-1]['LandAndOceanAverageTemperature'] if recent else 0
        
        return jsonify({
            'success': True,
            'historical': recent,
            'latest_average': latest_avg
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        model = joblib.load(model_path)
        
        # Expecting: land_avg, land_max, land_min
        features = pd.DataFrame([{
            'LandAverageTemperature': data['land_avg'],
            'LandMaxTemperature': data['land_max'],
            'LandMinTemperature': data['land_min']
        }])
        
        prediction = model.predict(features)[0]
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
