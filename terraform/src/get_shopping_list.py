import hashlib
import json
import boto3
from decimal_helper import DecimalEncoder
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
        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'shopping_list': user['shopping_list']}, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }