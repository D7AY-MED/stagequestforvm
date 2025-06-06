@echo off
echo ===== Setting up StageQuest API Server Only =====
echo.

echo Creating server directory if it doesn't exist...
if not exist server mkdir server

echo Setting up minimal package.json...
echo {> server\package.json
echo   "name": "stagequest-api",>> server\package.json
echo   "version": "1.0.0",>> server\package.json
echo   "description": "API server for StageQuest application",>> server\package.json
echo   "main": "index.js",>> server\package.json
echo   "scripts": {>> server\package.json
echo     "start": "node index.js">> server\package.json
echo   },>> server\package.json
echo   "dependencies": {>> server\package.json
echo     "cors": "^2.8.5",>> server\package.json
echo     "express": "^4.18.2">> server\package.json
echo   }>> server\package.json
echo }>> server\package.json

echo Creating minimal express server...
echo // Simple express server with registration endpoint> server\index.js
echo const express = require('express');>> server\index.js
echo const cors = require('cors');>> server\index.js
echo const path = require('path');>> server\index.js
echo.>> server\index.js
echo const app = express();>> server\index.js
echo const port = process.env.PORT || 3000;>> server\index.js
echo.>> server\index.js
echo // Middleware>> server\index.js
echo app.use(cors());>> server\index.js
echo app.use(express.json());>> server\index.js
echo app.use(express.static(path.join(__dirname, 'public')));>> server\index.js
echo.>> server\index.js
echo // Serve test page>> server\index.js
echo app.get('/test', (req, res) => {>> server\index.js
echo   res.sendFile(path.join(__dirname, 'test.html'));>> server\index.js
echo });>> server\index.js
echo.>> server\index.js
echo // Health check endpoint>> server\index.js
echo app.get('/api/health', (req, res) => {>> server\index.js
echo   res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });>> server\index.js
echo });>> server\index.js
echo.>> server\index.js
echo // Basic registration endpoint>> server\index.js
echo app.post('/api/register', (req, res) => {>> server\index.js
echo   console.log('Registration request received:', req.body);>> server\index.js
echo   const { name, company, email, password } = req.body;>> server\index.js
echo.>> server\index.js
echo   // Validate required fields>> server\index.js
echo   const missingFields = [];>> server\index.js
echo   if (!name) missingFields.push('name');>> server\index.js
echo   if (!company) missingFields.push('company');>> server\index.js
echo   if (!email) missingFields.push('email');>> server\index.js
echo   if (!password) missingFields.push('password');>> server\index.js
echo.>> server\index.js
echo   if (missingFields.length > 0) {>> server\index.js
echo     return res.status(400).json({ >> server\index.js
echo       error: `Missing required fields: ${missingFields.join(', ')}`,>> server\index.js
echo       details: { missingFields }>> server\index.js
echo     });>> server\index.js
echo   }>> server\index.js
echo.>> server\index.js
echo   // Mock successful response>> server\index.js
echo   res.status(201).json({>> server\index.js
echo     success: true,>> server\index.js
echo     token: `mock-token-${Date.now()}`,>> server\index.js
echo     user: {>> server\index.js
echo       id: `mock-${Date.now()}`,>> server\index.js
echo       name,>> server\index.js
echo       email,>> server\index.js
echo       company,>> server\index.js
echo       role: 'recruiter'>> server\index.js
echo     }>> server\index.js
echo   });>> server\index.js
echo });>> server\index.js
echo.>> server\index.js
echo // Create public directory for static content>> server\index.js
echo const fs = require('fs');>> server\index.js
echo if (!fs.existsSync(path.join(__dirname, 'public'))) {>> server\index.js
echo   fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });>> server\index.js
echo }>> server\index.js
echo.>> server\index.js
echo // Start server>> server\index.js
echo app.listen(port, '0.0.0.0', () => {>> server\index.js
echo   console.log(`API server running on http://localhost:${port}`);>> server\index.js
echo   console.log(`Test page available at http://localhost:${port}/test`);>> server\index.js
echo });>> server\index.js

echo Creating server directory structure...
if not exist server\public mkdir server\public

echo Installing server dependencies...
cd server
call npm install
cd ..

echo.
echo ===== Setup Complete =====
echo.
echo You can now run the server with:
echo cd server
echo npm start
echo.
echo The API will be available at http://localhost:3000
echo The test page will be available at http://localhost:3000/test
echo.
