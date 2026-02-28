import hashlib
import json
import boto3
import datetime
from decimal_helper import DecimalEncoder

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('user_details')

def lambda_handler(event, context):
    try:
        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        today = int(datetime.datetime.now().strftime('%Y%m%d'))

        active_items = [
            item for item in user['pantry']['items']
            if item['date_expiry'] > today
        ]

        expired_items = user.get('expired_pantry', {}).get('items', [])

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'pantry': active_items,
                'expired_pantry': expired_items
            }, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }
