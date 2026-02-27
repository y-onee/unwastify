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
        num_adults = body['num_adults']
        num_kids = body['num_kids']
        meals_per_day = body['meals_per_day']
        eat_out_per_week = body['eat_out_per_week']

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET family_info = :f',
            ExpressionAttributeValues={
                ':f': {
                    'num_adults': num_adults,
                    'num_kids': num_kids,
                    'meals_per_day': meals_per_day,
                    'eat_out_per_week': eat_out_per_week
                }
            }
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Family info updated successfully'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }