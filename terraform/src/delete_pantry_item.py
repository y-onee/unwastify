import json
import boto3
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

        original_length = len(user['pantry']['items'])
        
        user['pantry']['items'] = [
            item for item in user['pantry']['items']
            if int(item['pantry_item_id']) != pantry_item_id
        ]

        if len(user['pantry']['items']) == original_length:
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
            'body': json.dumps({'message': 'Item deleted from pantry'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }