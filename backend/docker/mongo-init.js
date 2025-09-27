// MongoDB initialization script
db = db.getSiblingDB('chatgpt-clone');

// Create collections with proper indexes
db.createCollection('users');
db.createCollection('chats');
db.createCollection('messages');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "supabaseId": 1 }, { unique: true });

db.chats.createIndex({ "userId": 1, "createdAt": -1 });
db.chats.createIndex({ "userId": 1, "lastMessageAt": -1 });

db.messages.createIndex({ "chatId": 1, "createdAt": 1 });
db.messages.createIndex({ "userId": 1, "createdAt": -1 });
db.messages.createIndex({ "status": 1, "createdAt": -1 });

print('Database initialization completed!');