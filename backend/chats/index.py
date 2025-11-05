import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage chats - create, get user chats, get messages
    Args: event - dict with httpMethod, body, queryStringParameters, headers
          context - object with request_id attribute
    Returns: HTTP response with chat data or messages
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required in X-User-Id header'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        chat_id = params.get('chat_id')
        
        if chat_id:
            chat_id_safe = int(chat_id)
            sql = f"SELECT m.id, m.text, m.sender_id, m.is_read, m.created_at, u.username as sender_username FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.chat_id = {chat_id_safe} ORDER BY m.created_at ASC"
            cur.execute(sql)
            messages = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'messages': [dict(msg) for msg in messages]
                }, default=str),
                'isBase64Encoded': False
            }
        else:
            user_id_safe = int(user_id)
            sql = f"""
                SELECT DISTINCT 
                    c.id as chat_id,
                    CASE 
                        WHEN c.user1_id = {user_id_safe} THEN c.user2_id 
                        ELSE c.user1_id 
                    END as other_user_id,
                    u.username as other_username,
                    u.avatar_url as other_avatar,
                    u.status as other_status,
                    (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                    (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != {user_id_safe} AND is_read = false) as unread_count
                FROM chats c
                JOIN users u ON (CASE WHEN c.user1_id = {user_id_safe} THEN c.user2_id ELSE c.user1_id END = u.id)
                WHERE c.user1_id = {user_id_safe} OR c.user2_id = {user_id_safe}
                ORDER BY last_message_time DESC NULLS LAST
            """
            cur.execute(sql)
            chats = cur.fetchall()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'chats': [dict(chat) for chat in chats]
                }, default=str),
                'isBase64Encoded': False
            }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'create_chat':
            other_user_id = body_data.get('other_user_id')
            
            if not other_user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'other_user_id required'}),
                    'isBase64Encoded': False
                }
            
            user1 = min(int(user_id), int(other_user_id))
            user2 = max(int(user_id), int(other_user_id))
            
            sql_check = f"SELECT id FROM chats WHERE user1_id = {user1} AND user2_id = {user2}"
            cur.execute(sql_check)
            existing_chat = cur.fetchone()
            
            if existing_chat:
                cur.close()
                conn.close()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'chat_id': existing_chat['id']}),
                    'isBase64Encoded': False
                }
            
            sql_insert = f"INSERT INTO chats (user1_id, user2_id) VALUES ({user1}, {user2}) RETURNING id"
            cur.execute(sql_insert)
            new_chat = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chat_id': new_chat['id']}),
                'isBase64Encoded': False
            }
        
        elif action == 'send_message':
            chat_id = body_data.get('chat_id')
            text = body_data.get('text', '').strip()
            
            if not chat_id or not text:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'chat_id and text required'}),
                    'isBase64Encoded': False
                }
            
            chat_id_safe = int(chat_id)
            user_id_safe = int(user_id)
            text_escaped = text.replace("'", "''")
            sql = f"INSERT INTO messages (chat_id, sender_id, text) VALUES ({chat_id_safe}, {user_id_safe}, '{text_escaped}') RETURNING id, created_at"
            cur.execute(sql)
            message = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message_id': message['id'],
                    'created_at': str(message['created_at'])
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'delete_chat':
            chat_id = body_data.get('chat_id')
            
            if not chat_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'chat_id required'}),
                    'isBase64Encoded': False
                }
            
            chat_id_safe = int(chat_id)
            user_id_safe = int(user_id)
            
            sql_del_messages = f"DELETE FROM messages WHERE chat_id = {chat_id_safe}"
            cur.execute(sql_del_messages)
            
            sql_del_chat = f"DELETE FROM chats WHERE id = {chat_id_safe} AND (user1_id = {user_id_safe} OR user2_id = {user_id_safe})"
            cur.execute(sql_del_chat)
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }