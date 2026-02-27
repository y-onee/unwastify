import json
import boto3
import datetime
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

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        expired_item = None
        for item in user['pantry']['items']:
            if int(item['pantry_item_id']) == pantry_item_id:
                expired_item = item
                break

        if not expired_item:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Item not found in pantry'})
            }

        user['pantry']['items'].remove(expired_item)

        today = datetime.date.today().strftime("%Y-%m-%d")
        expired_item['date_expiry'] = today

        if 'expired_pantry' not in user:
            user['expired_pantry'] = {'items': []}

        user['expired_pantry']['items'].append(expired_item)

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET pantry = :p, expired_pantry = :ep',
            ExpressionAttributeValues={
                ':p': user['pantry'],
                ':ep': user['expired_pantry']
            }
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Item marked as expired and moved to expired pantry'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }