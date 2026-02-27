import boto3
import pandas as pd
from xgboost import XGBRegressor
import json

model = XGBRegressor()
model.load_model('/var/task/model.json')

def handler(event, context):
    if isinstance(event.get('body'), str):
        body=json.loads(event['body'])
    elif isinstance(event.get('body'), dict):
        body=event['body']
    else:
        body = event
    
    input_data = pd.DataFrame([{
        'num_adults': body['num_adults'],
        'num_kids': body['num_kids'],
        'eating_out_frequency': body['eating_out_frequency'],
        'avg_temp_celsius': body['avg_temp_celsius'],
        'natural_shelf_life_days': body['natural_shelf_life_days'], 
        'consumption_rate': body['consumption_rate']
    }])
    
    predicted_qty = round(float(model.predict(input_data)[0]))
    
    return {
        'statusCode': 200,
        'body': json.dumps({'predicted_quantity': predicted_qty})
    }