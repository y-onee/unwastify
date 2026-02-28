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

def _safe_int(val):
    if val is None:
        return 0
    if isinstance(val, Decimal):
        return int(val)
    return int(val)

def lambda_handler(event, context):
    try:
        body = event.get('body')
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event or {}

        sub = event['requestContext']['authorizer']['claims']['sub']
        user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12
        try:
            pantry_item_id = _safe_int(body.get('pantry_item_id'))
            wasted_qty = _safe_int(body.get('wasted_qty', 0))
        except (TypeError, ValueError):
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Invalid pantry_item_id or wasted_qty'})
            }

        user_response = users_table.get_item(Key={'user_id': user_id})
        user = user_response.get('Item')
        if not user:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'User not found'})
            }

        pantry_items = user.get('pantry', {}).get('items', []) or []
        # Find the item in pantry or expired_pantry and update wasted quantity
        item_found = False
        in_expired = False

        for item in pantry_items:
            if _safe_int(item.get('pantry_item_id')) == pantry_item_id:
                item['wasted'] = wasted_qty
                item_found = True
                break

        if not item_found:
            expired = user.get('expired_pantry') or {}
            expired_items = expired.get('items', []) or []
            for item in expired_items:
                if _safe_int(item.get('pantry_item_id')) == pantry_item_id:
                    item['wasted'] = wasted_qty
                    item_found = True
                    in_expired = True
                    break

        if not item_found:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Item not found in pantry'})
            }

        if in_expired:
            expired = user.get('expired_pantry') or {}
            if 'items' not in expired:
                expired = {'items': []}
            users_table.update_item(
                Key={'user_id': user_id},
                UpdateExpression='SET expired_pantry = :ep',
                ExpressionAttributeValues={':ep': expired}
            )
        else:
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