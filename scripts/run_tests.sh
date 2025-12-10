#!/bin/bash

# Test runner script

echo "🧪 Running Communication Coach Tests"

# Frontend tests
echo "📱 Running frontend tests..."
cd frontend
if [ -f "package.json" ]; then
    npm test -- --coverage --watchAll=false
    if [ $? -ne 0 ]; then
        echo "❌ Frontend tests failed"
        exit 1
    fi
else
    echo "⚠️ Frontend package.json not found, skipping frontend tests"
fi

# Backend tests
echo "🐍 Running backend tests..."
cd ../backend
if [ -f "requirements.txt" ]; then
    python -m pytest tests/ -v --cov=app --cov-report=html
    if [ $? -ne 0 ]; then
        echo "❌ Backend tests failed"
        exit 1
    fi
else
    echo "⚠️ Backend requirements.txt not found, skipping backend tests"
fi

# E2E tests
echo "🌐 Running end-to-end tests..."
cd ../frontend
if command -v playwright &> /dev/null; then
    npm run test:e2e
    if [ $? -ne 0 ]; then
        echo "❌ E2E tests failed"
        exit 1
    fi
else
    echo "⚠️ Playwright not found, skipping E2E tests"
fi

echo "✅ All tests completed successfully!"
