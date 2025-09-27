# ChatGPT Clone Backend

A robust NestJS backend application for a ChatGPT-like chat interface, featuring MongoDB integration, Supabase authentication, and simulated LLM responses.

## Features

- **Authentication**: Supabase integration with JWT token verification
- **Database**: MongoDB with Mongoose ODM
- **Real-time Chat**: Support for multiple chat sessions per user
- **LLM Simulation**: Configurable delay simulation (10-20 seconds) for AI responses
- **Security**: Role-based access control and data ownership validation
- **Scalability**: Modular architecture with proper separation of concerns
- **Error Handling**: Global exception filters and comprehensive logging
- **Health Checks**: Built-in health monitoring endpoints
- **Docker Support**: Full containerization with MongoDB

## Architecture

```
src/
├── config/           # Configuration management
├── schemas/          # MongoDB schemas (User, Chat, Message)
├── modules/          # Feature modules
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── chats/        # Chat sessions
│   ├── messages/     # Message handling
│   ├── llm/          # LLM simulation service
│   └── health/       # Health check endpoints
├── common/           # Shared utilities
│   ├── filters/      # Exception filters
│   └── interceptors/ # Request/response interceptors
└── main.ts           # Application bootstrap
```

## Prerequisites

- Node.js 18.x or higher
- MongoDB 5.x or higher
- Supabase account and project
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chatgpt-clone-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3001
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/chatgpt-clone
   
   # Supabase
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   
   # JWT
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=24h
   
   # LLM Simulation
   LLM_MIN_DELAY=10000
   LLM_MAX_DELAY=20000
   
   # CORS
   FRONTEND_URL=http://localhost:3000
   ```

## Running the Application

### Development Mode

```bash
# Start MongoDB (if running locally)
mongod

# Start the development server
npm run start:dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Using Docker

```bash
# Start all services (MongoDB + Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/refresh` | Refresh authentication token |
| GET | `/api/v1/auth/me` | Get current user profile |
| POST | `/api/v1/auth/logout` | Logout user |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chats` | Get user's chats |
| POST | `/api/v1/chats` | Create new chat |
| GET | `/api/v1/chats/:id` | Get specific chat |
| PUT | `/api/v1/chats/:id` | Update chat |
| DELETE | `/api/v1/chats/:id` | Delete chat |
| GET | `/api/v1/chats/count` | Get user's chat count |

### Message Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/messages/new-chat` | Start new chat with message |
| GET | `/api/v1/chats/:chatId/messages` | Get chat messages |
| POST | `/api/v1/chats/:chatId/messages` | Send message |
| PUT | `/api/v1/chats/:chatId/messages/:messageId` | Update message |
| DELETE | `/api/v1/chats/:chatId/messages/:messageId` | Delete message |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/profile` | Get user profile |
| PUT | `/api/v1/users/profile` | Update user profile |
| DELETE | `/api/v1/users/profile` | Deactivate account |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Application health status |
| GET | `/api/v1/health/database` | Database connection status |

## Authentication Flow

1. **Frontend Login**: User authenticates via Supabase (email/password or OAuth)
2. **Token Verification**: Backend verifies Supabase JWT tokens
3. **User Management**: Creates/updates user records in MongoDB
4. **Session Management**: Maintains user sessions across requests
5. **Authorization**: Protects all chat-related endpoints

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  avatar: String (optional),
  supabaseId: String (unique),
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Chats Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  messageCount: Number,
  lastMessageAt: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  chatId: ObjectId (ref: Chat),
  userId: ObjectId (ref: User),
  content: String,
  role: String (user|assistant|system),
  status: String (pending|completed|failed),
  tokenCount: Number (optional),
  metadata: Object (optional),
  processedAt: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## LLM Integration

The backend simulates LLM integration to demonstrate proper async handling:

- **Service Abstraction**: `LlmService` handles all AI-related operations
- **Async Processing**: Non-blocking request handling with configurable delays
- **Error Handling**: Graceful failure handling with retry mechanisms
- **Response Simulation**: Contextual responses based on user input
- **Token Estimation**: Basic token counting for response metrics

## Security Features

- **Authentication**: Supabase JWT token validation
- **Authorization**: User-specific data access controls
- **Data Ownership**: Users can only access their own chats/messages
- **Input Validation**: Comprehensive DTO validation
- **Error Handling**: Secure error responses without sensitive data leakage
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Can be extended with rate limiting middleware

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

## Monitoring & Logging

- **Global Exception Filter**: Centralized error handling and logging
- **Request Logging**: HTTP request/response logging with timing
- **Health Checks**: Application and database health monitoring
- **Performance Metrics**: Response time tracking

## Deployment

### Docker Deployment

```bash
# Build and start services
docker-compose up -d

# Scale backend instances
docker-compose up -d --scale backend=3
```

### Cloud Deployment

The application is ready for deployment on:
- **AWS**: ECS, Elastic Beanstalk, or EC2
- **Google Cloud**: Cloud Run, GKE, or Compute Engine
- **Azure**: Container Instances, AKS, or App Service
- **Railway**: Direct deployment from GitHub
- **Render**: Web service deployment

## 🔧 Configuration

Key configuration options in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3001 |
| `MONGODB_URI` | MongoDB connection string | localhost:27017 |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key | - |
| `LLM_MIN_DELAY` | Minimum AI response delay (ms) | 10000 |
| `LLM_MAX_DELAY` | Maximum AI response delay (ms) | 20000 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- NestJS framework for the robust architecture
- MongoDB for the flexible document database
- Supabase for authentication services
- Docker for containerization support

---

For questions or support, please open an issue or contact the development team.