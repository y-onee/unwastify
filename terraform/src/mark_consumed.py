import json
import boto3
import hashlib
from decimal_helper import DecimalEncoder

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('user_details')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
}

def _safe_int(val):
    if val is None:
        return 0
    from decimal import Decimal
    if isinstance(val, Decimal):
        return int(val)
    return int(val)

def lambda_handler(event, context):
    try:
        body = event.get('body')
        if isinstance(body, str):
            body = json.loads(body)
        elif body is None:
            body = event

        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12
        pantry_item_id = _safe_int(body.get('pantry_item_id'))

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        found = False
        for item in user['pantry']['items']:
            if _safe_int(item.get('pantry_item_id')) == pantry_item_id:
                item['consumed'] = True
                found = True
                break

        if not found:
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
            'body': json.dumps({'message': 'Item marked as consumed'}, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }
