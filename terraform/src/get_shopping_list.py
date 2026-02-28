import hashlib
import json
import boto3
from decimal_helper import DecimalEncoder
import datetime

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
        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        # Get current week
        week_date = datetime.datetime.now().strftime('%Y%m%d')
        current_week = None
        
        for week in user['shopping_list']['weeks']:
            if (datetime.datetime.strptime(week_date, '%Y%m%d') - datetime.datetime.strptime(week['date'], '%Y%m%d')).days < 7:
                current_week = week
                break
        
        # If no current week, return empty structure
        if not current_week:
            current_week = {
                'week_id': '0',
                'date': week_date,
                'items': []
            }

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