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
        shopping_item_id = body['shopping_item_id']

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        # Find current week
        import datetime
        current_week = None
        for week in user['shopping_list']['weeks']:
            if (datetime.datetime.strptime(datetime.datetime.now().strftime('%Y%m%d'), '%Y%m%d') - datetime.datetime.strptime(week['date'], '%Y%m%d')).days < 7:
                current_week = week
                break

        if not current_week:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'No active shopping list found'})
            }

        original_length = len(current_week['items'])
        current_week['items'] = [
            item for item in current_week['items']
            if int(item['shopping_item_id']) != shopping_item_id
        ]

        if len(current_week['items']) == original_length:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Item not found in shopping list'})
            }

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET shopping_list = :sl',
            ExpressionAttributeValues={':sl': user['shopping_list']}
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Item deleted from shopping list'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }