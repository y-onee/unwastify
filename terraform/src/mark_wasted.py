import json
import boto3
import datetime
from decimal import Decimal
import hashlib

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('user_details')

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
        pantry_item_id = body['pantry_item_id']
        wasted_qty = body['wasted_qty']

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        # Find the item in pantry and update wasted quantity
        item_found = False

        for item in user['pantry']['items']:
            if int(item['pantry_item_id']) == pantry_item_id:
                item['wasted'] = int(item['wasted']) + wasted_qty
                item_found = True
                break

        if not item_found:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Item not found in pantry'})
            }

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET pantry = :p',
            ExpressionAttributeValues={':p': user['pantry']}
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Waste quantity updated'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }