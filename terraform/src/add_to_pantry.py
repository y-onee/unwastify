import json
import boto3
import datetime
import time
from decimal_helper import DecimalEncoder
import hashlib

dynamodb = boto3.resource('dynamodb')
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
        body = event.get('body')
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event

        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12
        item_name = body['item_name']
        qty = body['qty']

        shelf_response = shelf_life_table.scan(
            FilterExpression='item_name = :item_name',
            ExpressionAttributeValues={':item_name': item_name}
        )

        if shelf_response['Count'] == 0:
            if 'shelf_life' not in body:
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Item not found. Please provide shelf_life to add it.'})
                }

            new_item_id = int(time.time() * 1000)
            shelf_life_table.put_item(
                Item={
                    'item_id': new_item_id,
                    'item_name': item_name,
                    'shelf_life': body['shelf_life']
                }
            )
            shelf_life = int(body['shelf_life'])
            item_id = new_item_id
        else:
            shelf_item = shelf_response['Items'][0]
            shelf_life = int(shelf_item['shelf_life'])
            item_id = int(shelf_item['item_id'])

        date_bought = int(datetime.datetime.now().strftime('%Y%m%d'))
        date_expiry = int((datetime.datetime.now() + datetime.timedelta(days=shelf_life)).strftime('%Y%m%d'))

        new_item = {
            'pantry_item_id': int(time.time() * 1000),
            'item_id': item_id,
            'item_name': item_name,
            'qty': qty,
            'wasted': 0,
            'date_bought': date_bought,
            'date_expiry': date_expiry
        }

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        for item in user['pantry']['items']:
            if item['item_name'] == item_name:
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Item already exists in pantry'})
                }

        user['pantry']['items'].append(new_item)

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET pantry = :p',
            ExpressionAttributeValues={':p': user['pantry']}
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Item added to pantry', 'item': new_item}, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }