import hashlib
import json
import datetime
import boto3
from decimal_helper import DecimalEncoder
import time

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

def lambda_handler(event, context):
    try:
        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        pantry_items = user['pantry']['items']
        family_info = user['family_info']

        flagged_items = []

        for item in pantry_items:
            days_until_expiry = (datetime.datetime.strptime(str(item['date_expiry']), '%Y%m%d') - datetime.datetime.now()).days
            qty_left = item['qty'] - item['wasted']

            if days_until_expiry <= 2 or qty_left <= 0:
                flagged_items.append(item)

        num_adults = int(family_info['num_adults'])
        num_kids = int(family_info['num_kids'])
        effective_persons = num_adults + (0.6 * num_kids)
        eat_out_frequency = round(family_info['eat_out_per_week'] / (family_info['meals_per_day'] * 7), 3)

        shopping_list = []

        for item in flagged_items:
            shelf_items_response = shelf_life_table.get_item(Key={'item_id': int(item['item_id'])})
            print("shelf response:", shelf_items_response)
            print("item_id being queried:", item['item_id'], type(item['item_id']))

            item['shelf_life'] = int(shelf_items_response['Item']['shelf_life'])

            qty_consumed = int(item['qty']) - int(item['wasted'])
            consumption_rate = round(qty_consumed / effective_persons, 3)

            payload = {
                'num_adults': num_adults,
                'num_kids': num_kids,
                'eating_out_frequency': eat_out_frequency,
                'avg_temp_celsius': 22.0,
                'natural_shelf_life_days': item['shelf_life'],
                'consumption_rate': consumption_rate
            }

            response = lambda_client.invoke(
                FunctionName='shopping_model',
                InvocationType='RequestResponse',
                Payload=json.dumps(payload, cls=DecimalEncoder)
            )

            

            result = json.loads(json.loads(response['Payload'].read())['body'])
            print(result)
            predicted_qty = result['predicted_quantity']

            shopping_list.append({
                'item_id': int(item['item_id']),
                'item_name': item['item_name'],
                'qty': predicted_qty
            })

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
            if item['item_name'] not in existing_item_names and item['qty'] != 0
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
            'body': json.dumps({'shopping_list': current_week}, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }