#!/bin/bash
echo "Setup started at $(date)" > setup.log
echo "Current directory: $(pwd)" >> setup.log

# Copy files explicitly
echo "Copying files..." >> setup.log
cp -R /Users/benjamindisbury/ANTIGRAVITY/CASPERS_PAINTWORKS/. . >> setup.log 2>&1

echo "Listing files after copy:" >> setup.log
ls -la >> setup.log 2>&1

# Install dependencies
echo "Installing dependencies..." >> setup.log
rm -rf node_modules package-lock.json >> setup.log 2>&1
npm install --legacy-peer-deps >> setup.log 2>&1

# Database migration
echo "Migrating database..." >> setup.log
npx drizzle-kit push >> setup.log 2>&1

# Download images
echo "Downloading images..." >> setup.log
npx tsx scripts/download_images.ts >> setup.log 2>&1

# Start server
echo "Starting server..." >> setup.log
npm run dev >> setup.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID" >> setup.log

# Wait a bit to catch early errors
sleep 5
if ps -p $SERVER_PID > /dev/null
then
   echo "Server is running." >> setup.log
else
   echo "Server failed to start." >> setup.log
fi
