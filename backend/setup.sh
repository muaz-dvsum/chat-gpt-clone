#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ChatGPT Clone Backend Setup${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18.x or higher.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18.x or higher. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) detected${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️  Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update the .env file with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB is available${NC}"
else
    echo -e "${YELLOW}⚠️  MongoDB not found locally. Make sure to update MONGODB_URI in .env${NC}"
fi

# Build the application
echo -e "${YELLOW}🔨 Building the application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed, but setup continues${NC}"
else
    echo -e "${GREEN}✅ All tests passed${NC}"
fi

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "1. Update your .env file with proper configuration"
echo -e "2. Ensure MongoDB is running"
echo -e "3. Set up your Supabase project and update credentials"
echo -e "4. Run: ${GREEN}npm run start:dev${NC} to start development server"
echo -e "5. Or run: ${GREEN}docker-compose up -d${NC} to start with Docker"

echo -e "\n${GREEN}🌐 Available endpoints:${NC}"
echo -e "- Health Check: http://localhost:3001/api/v1/health"
echo -e "- API Documentation: See README.md for full API reference"
echo -e "- MongoDB Express (Docker): http://localhost:8081 (admin/admin)"