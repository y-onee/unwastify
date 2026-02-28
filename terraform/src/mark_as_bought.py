import json
import boto3
import datetime
import time
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
        shopping_item_id = body['shopping_item_id']

        # Fetch user first before using it
        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response['Item']

        # Find current week
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

        # Find item by shopping_item_id
        bought_item = None
        for item in current_week['items']:
            if int(item['shopping_item_id']) == shopping_item_id:
                item['bought'] = True
                bought_item = item
                break

        if not bought_item:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Item not found in shopping list'})
            }

        item_name = bought_item['item_name']

        # Get shelf life
        shelf_response = shelf_life_table.scan(
            FilterExpression='item_name = :item_name',
            ExpressionAttributeValues={':item_name': item_name}
        )
        
        if shelf_response['Count'] == 0:
            # if item not in shelf life table, create entry with default life (7 days)
            shelf_life = 7
            item_id = int(time.time() * 1000)
            shelf_life_table.put_item(
                Item={
                    'item_id': item_id,
                    'item_name': item_name,
                    'shelf_life': shelf_life
                }
            )
        else:
            shelf_life = int(shelf_response['Items'][0]['shelf_life'])
            item_id = int(shelf_response['Items'][0]['item_id'])

        # Add to pantry
        date_bought = int(datetime.datetime.now().strftime('%Y%m%d'))
        date_expiry = int((datetime.datetime.now() + datetime.timedelta(days=shelf_life)).strftime('%Y%m%d'))

        new_pantry_item = {
            'pantry_item_id': int(time.time() * 1000),
            'item_id': item_id,
            'item_name': item_name,
            'qty': int(bought_item['qty']),
            'wasted': 0,
            'date_bought': date_bought,
            'date_expiry': date_expiry
        }

        user['pantry']['items'].append(new_pantry_item)

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET shopping_list = :sl, pantry = :p',
            ExpressionAttributeValues={
                ':sl': user['shopping_list'],
                ':p': user['pantry']
            }
        )

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': 'Item marked as bought and added to pantry'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': str(e)})
        }