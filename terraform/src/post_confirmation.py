import boto3
import hashlib

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('user_details')

def lambda_handler(event, context):
    sub = event['request']['userAttributes']['sub']
    user_id = int(hashlib.md5(sub.encode()).hexdigest(), 16) % 10**12
    email = event['request']['userAttributes']['email']
    name = event['request']['userAttributes'].get('name', '')

    users_table.put_item(
        Item={
            'user_id': user_id,
            'user_profile': {
                'user_name': name,
                'user_email': email
            },
            'pantry': {'items': []},
            'shopping_list': {'weeks': []},
            'expired_pantry': {'items': []},
            'family_info': {}
        }
    )

    return event