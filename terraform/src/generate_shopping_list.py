import hashlib
import json
import datetime
import boto3
from decimal_helper import DecimalEncoder
import time
import urllib.request
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed

dynamodb = boto3.resource('dynamodb')
lambda_client = boto3.client('lambda')

users_table = dynamodb.Table('user_details')
shelf_life_table = dynamodb.Table('shelf_life')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
}

def get_temperature(lat, lon):
    """Fetch current temperature in Celsius from Open-Meteo (free, no API key)."""
    try:
        url = (f"https://api.open-meteo.com/v1/forecast?"
               f"latitude={lat}&longitude={lon}&current_weather=true")
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(url, timeout=8, context=ctx) as resp:
            data = json.loads(resp.read())
        temp = float(data['current_weather']['temperature'])
        print(f"[weather] {temp}°C at ({lat}, {lon})")
        return temp
    except Exception as e:
        print(f"[weather] failed: {type(e).__name__}: {e} — using fallback 22°C")
        return 22.0

def predict_for_item(item, num_adults, num_kids, eat_out_frequency, avg_temp, effective_persons):
    """Fetch shelf life and invoke the ML model for a single item. Runs in a thread."""
    shelf_items_response = shelf_life_table.get_item(Key={'item_id': int(item['item_id'])})
    if 'Item' in shelf_items_response:
        shelf_life = int(shelf_items_response['Item']['shelf_life'])
    else:
        print(f"[generate_shopping_list] WARNING: item_id {item.get('item_id')} not found in shelf_life table. Defaulting to 7 days.")
        shelf_life = 7
    qty_consumed = int(item['qty']) - int(item['wasted'])
    consumption_rate = round(qty_consumed / effective_persons, 3)

    payload = {
        'num_adults': num_adults,
        'num_kids': num_kids,
        'eating_out_frequency': eat_out_frequency,
        'avg_temp_celsius': avg_temp,
        'natural_shelf_life_days': shelf_life,
        'consumption_rate': consumption_rate
    }

    response = lambda_client.invoke(
        FunctionName='shopping_model',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload, cls=DecimalEncoder)
    )

    result = json.loads(json.loads(response['Payload'].read())['body'])
    predicted_qty = int(result['predicted_quantity'])

    return {
        'item_id': int(item['item_id']),
        'item_name': item['item_name'],
        'qty': predicted_qty
    }

def lambda_handler(event, context):
    try:
        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12

        # Manual temperature override takes priority
        query_params = event.get('queryStringParameters') or {}
        temp_override = query_params.get('temp')
        lat = query_params.get('lat')
        lon = query_params.get('lon')

        if temp_override is not None:
            avg_temp = float(temp_override)
            print(f"Using manual temperature: {avg_temp}°C")
        elif lat is not None and lon is not None:
            avg_temp = get_temperature(float(lat), float(lon))
        else:
            avg_temp = 22.0
        print(f"Using temperature: {avg_temp}°C (lat={lat}, lon={lon})")

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        pantry_items = user['pantry']['items']
        family_info = user['family_info']

        flagged_items = []
        for item in pantry_items:
            days_until_expiry = (datetime.datetime.strptime(str(item['date_expiry']), '%Y%m%d') - datetime.datetime.now()).days
            qty_left = item['qty'] - item['wasted']
            if days_until_expiry <= 2 or qty_left <= 0 or item.get('consumed', False):
                flagged_items.append(item)

        # Also include items manually marked as expired — they need replacing too
        # Only include expired items that have a valid item_id (needed by the ML model)
        expired_items = user.get('expired_pantry', {}).get('items', [])
        for ei in expired_items:
            if ei.get('item_id') is not None:
                flagged_items.append(ei)

        num_adults = int(family_info['num_adults'])
        num_kids = int(family_info['num_kids'])
        effective_persons = num_adults + (0.6 * num_kids)
        eat_out_frequency = round(family_info['eat_out_per_week'] / (family_info['meals_per_day'] * 7), 3)

        # Invoke ML model for all flagged items IN PARALLEL
        shopping_list = []
        with ThreadPoolExecutor(max_workers=min(len(flagged_items), 10)) as executor:
            futures = {
                executor.submit(
                    predict_for_item,
                    item, num_adults, num_kids, eat_out_frequency, avg_temp, effective_persons
                ): item
                for item in flagged_items
            }
            for future in as_completed(futures):
                result = future.result()
                shopping_list.append(result)

        week_date = datetime.datetime.now().strftime('%Y%m%d')
        existing_weeks = user['shopping_list']['weeks']

        current_week = None
        for week in existing_weeks:
            if (datetime.datetime.strptime(week_date, '%Y%m%d') - datetime.datetime.strptime(week['date'], '%Y%m%d')).days < 7:
                current_week = week
                break

        existing_item_names = []
        if current_week:
            existing_item_names = [i['item_name'] for i in current_week['items']]

        new_items = [
            {
                'shopping_item_id': int(time.time() * 1000) + i,
                'item_name': item['item_name'],
                'qty': item['qty'],
                'bought': False
            }
            for i, item in enumerate(shopping_list)
            if item['item_name'] not in existing_item_names and item['qty'] > 0
        ]

        if current_week:
            current_week['items'].extend(new_items)
        else:
            existing_weeks.append({
                'week_id': str(len(existing_weeks) + 1),
                'date': week_date,
                'items': new_items
            })

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET shopping_list = :sl',
            ExpressionAttributeValues={':sl': user['shopping_list']}
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'shopping_list': current_week,
                'temperature_used': avg_temp
            }, cls=DecimalEncoder)
        }
    except Exception as e:
        import traceback
        print(f"[generate_shopping_list] ERROR: {type(e).__name__}: {e}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }