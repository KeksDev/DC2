#!/bin/bash

# DC2 Development Setup Script

echo "🚀 Starting DC2 Privacy-Focused Discord..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   Docker: docker run -d -p 27017:27017 --name dc2-mongo mongo:7.0"
    echo "   Local:  mongod --dbpath /path/to/data"
    exit 1
fi

echo "✅ MongoDB is running"

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 DC2 is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "❤️  Health:   http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait