# ChatGPT Clone Backend - API Testing Guide

This document provides examples for testing all API endpoints using curl or any REST client.

## Authentication

All endpoints (except health checks) require authentication. Include the Supabase JWT token in the Authorization header:

```bash
Authorization: Bearer <your-supabase-jwt-token>
```

## Base URL

Development: `http://localhost:3001/api/v1`
Production: `https://your-domain.com/api/v1`

## API Endpoints

### Health Check

```bash
# Check application health
curl -X GET http://localhost:3001/api/v1/health

# Check database health
curl -X GET http://localhost:3001/api/v1/health/database
```

### Authentication

```bash
# Get current user profile
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer <token>"

# Refresh token
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "<refresh-token>"}'

# Logout
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer <token>"
```

### Users

```bash
# Get user profile
curl -X GET http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer <token>"

# Update user profile
curl -X PUT http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "avatar": "https://example.com/avatar.png"
  }'

# Deactivate account
curl -X DELETE http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer <token>"
```

### Chats

```bash
# Get all user chats
curl -X GET "http://localhost:3001/api/v1/chats?page=1&limit=20" \
  -H "Authorization: Bearer <token>"

# Search chats
curl -X GET "http://localhost:3001/api/v1/chats?search=javascript" \
  -H "Authorization: Bearer <token>"

# Create new chat
curl -X POST http://localhost:3001/api/v1/chats \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Chat About AI"}'

# Get specific chat
curl -X GET http://localhost:3001/api/v1/chats/<chat-id> \
  -H "Authorization: Bearer <token>"

# Update chat
curl -X PUT http://localhost:3001/api/v1/chats/<chat-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Chat Title"}'

# Delete chat
curl -X DELETE http://localhost:3001/api/v1/chats/<chat-id> \
  -H "Authorization: Bearer <token>"

# Get chat count
curl -X GET http://localhost:3001/api/v1/chats/count \
  -H "Authorization: Bearer <token>"
```

### Messages

```bash
# Start new chat with first message
curl -X POST http://localhost:3001/api/v1/messages/new-chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, can you help me with JavaScript?",
    "role": "user"
  }'

# Get messages from a chat
curl -X GET "http://localhost:3001/api/v1/chats/<chat-id>/messages?page=1&limit=50" \
  -H "Authorization: Bearer <token>"

# Send message to existing chat
curl -X POST http://localhost:3001/api/v1/chats/<chat-id>/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What are the benefits of using TypeScript?",
    "role": "user"
  }'

# Get specific message
curl -X GET http://localhost:3001/api/v1/chats/<chat-id>/messages/<message-id> \
  -H "Authorization: Bearer <token>"

# Update message (user messages only)
curl -X PUT http://localhost:3001/api/v1/chats/<chat-id>/messages/<message-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated message content"
  }'

# Delete message
curl -X DELETE http://localhost:3001/api/v1/chats/<chat-id>/messages/<message-id> \
  -H "Authorization: Bearer <token>"
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {  // For paginated endpoints
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Chat not found",
    "error": "NotFoundException",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/chats/invalid-id"
  }
}
```

## Example Testing Workflow

1. **Setup Authentication**: Get JWT token from Supabase
2. **Create Chat**: Start new conversation
3. **Send Messages**: Send user messages and receive AI responses
4. **Monitor Responses**: Check message status (pending → completed)
5. **Manage Chats**: List, update, and delete chats as needed

## Message Status Flow

1. **User Message**: `status: "completed"` (immediate)
2. **Assistant Message**: `status: "pending"` → `status: "completed"` (after 10-20s delay)
3. **Failed Message**: `status: "failed"` (if error occurs)

## Testing with Postman

Import the following collection structure:

```json
{
  "info": {
    "name": "ChatGPT Clone API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3001/api/v1"
    },
    {
      "key": "jwt_token",
      "value": "your-jwt-token-here"
    }
  ]
}
```

## WebSocket Support (Future Enhancement)

For real-time message updates, consider implementing WebSocket connections:

```javascript
// Future WebSocket endpoint
const socket = io('http://localhost:3001');
socket.on('message:update', (data) => {
  // Handle real-time message updates
});
```

## Rate Limiting

The API includes basic rate limiting. Implement client-side retry logic for production use:

```javascript
const retryRequest = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
};
```