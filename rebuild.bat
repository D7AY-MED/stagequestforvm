@echo off
setlocal enabledelayedexpansion

REM Parse command line arguments
set SKIP_NPM_INSTALL=0
set SKIP_FRONTEND_BUILD=0
set SKIP_PRUNE=0
set CONTINUE_ON_ERROR=0
set FIX_FRONTEND=0
set USE_ALT_PORT=0

:parse_args
if "%~1"=="" goto :start
if /i "%~1"=="--skip-npm" set SKIP_NPM_INSTALL=1
if /i "%~1"=="--skip-frontend" set SKIP_FRONTEND_BUILD=1
if /i "%~1"=="--skip-prune" set SKIP_PRUNE=1
if /i "%~1"=="--continue" set CONTINUE_ON_ERROR=1
if /i "%~1"=="--fix-front-end" set FIX_FRONTEND=1
if /i "%~1"=="--alt-port" set USE_ALT_PORT=1
if /i "%~1"=="--help" goto :help
shift
goto :parse_args

:help
echo.
echo StageQuest Complete Rebuild
echo Usage: rebuild.bat [options]
echo.
echo Options:
echo   --skip-npm        Skip npm install
echo   --skip-frontend   Skip frontend build
echo   --skip-prune      Skip Docker prune
echo   --continue        Continue on error
echo   --fix-frontend    Apply fixes to frontend container
echo   --alt-port        Use port 8080 instead of 80
echo   --help            Show this help message
echo.
exit /b 0

:start
echo ===== StageQuest Complete Rebuild =====
echo.

echo Step 1: Stopping all containers
docker-compose down
if %ERRORLEVEL% NEQ 0 (
    echo Error stopping containers!
    if %CONTINUE_ON_ERROR%==0 exit /b %ERRORLEVEL%
)

if %SKIP_PRUNE%==0 (
    echo.
    echo Step 2: Removing Docker build cache
    docker builder prune -f
    if %ERRORLEVEL% NEQ 0 (
        echo Error pruning Docker cache!
        if %CONTINUE_ON_ERROR%==0 exit /b %ERRORLEVEL%
    )
) else (
    echo.
    echo Step 2: Skipping Docker prune
)

if %FIX_FRONTEND%==1 (
    echo.
    echo Step 2.1: Applying fixes to the frontend Dockerfile
    
    echo Creating fixed Dockerfile...
    echo # Simple nginx-based Dockerfile > Dockerfile
    echo FROM nginx:alpine >> Dockerfile
    echo. >> Dockerfile
    echo # Install debugging tools >> Dockerfile
    echo RUN apk add --no-cache curl bash >> Dockerfile
    echo. >> Dockerfile
    echo # Copy pre-built files to nginx html directory >> Dockerfile
    echo COPY dist /usr/share/nginx/html >> Dockerfile
    echo. >> Dockerfile
    echo # Create env-config.js file >> Dockerfile
    echo RUN echo 'window.ENV = {' ^> /usr/share/nginx/html/env-config.js ^&^& ^\ >> Dockerfile
    echo     echo '  "VITE_API_URL": "http://localhost:3000",' ^>^> /usr/share/nginx/html/env-config.js ^&^& ^\ >> Dockerfile
    echo     echo '  "IS_DOCKER": true,' ^>^> /usr/share/nginx/html/env-config.js ^&^& ^\ >> Dockerfile
    echo     echo '  "VITE_STUDENT_SUPABASE_URL": "https://merambntyjutvpocjyin.supabase.co",' ^>^> /usr/share/nginx/html/env-config.js ^&^& ^\ >> Dockerfile
    echo     echo '  "VITE_STUDENT_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcmFtYm50eWp1dHZwb2NqeWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTIyNTMsImV4cCI6MjA2MTI4ODI1M30.NSB7wKx5AKND5jK-PTKY-AQRVHmpxtCBGaIsEUuQ0MI",' ^>^> /usr/share/nginx/html/env-config.js ^&^& ^\ >> Dockerfile
    echo     echo '  "REACT_APP_AZURE_CLIENT_ID": "dad8c5ba-b384-42da-946e-3bc8ebfdb1d2",' ^>^> /usr/share/nginx/html/env-config.js ^&^& ^\ >> Dockerfile
    echo     echo '  "REACT_APP_AZURE_TENANT_ID": "748c584f-0cee-4bb9-addb-f12ec194e7c9"' ^>^> /usr/share/nginx/html/env-config.js ^&^& ^\ >> Dockerfile
    echo     echo '};' ^>^> /usr/share/nginx/html/env-config.js >> Dockerfile
    echo. >> Dockerfile
    echo # Configure nginx >> Dockerfile
    echo RUN echo 'server {' ^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    listen 80;' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    server_name localhost;' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    root /usr/share/nginx/html;' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    index index.html;' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    location / {' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '        try_files $uri $uri/ /index.html;' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    }' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    location /health {' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '        access_log off;' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '        add_header Content-Type text/plain;' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '        return 200 "healthy";' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '    }' ^>^> /etc/nginx/conf.d/default.conf ^&^& ^\ >> Dockerfile
    echo     echo '}' ^>^> /etc/nginx/conf.d/default.conf >> Dockerfile
    echo. >> Dockerfile
    echo # Expose port 80 >> Dockerfile
    echo EXPOSE 80 >> Dockerfile
    echo. >> Dockerfile
    echo # Default command >> Dockerfile
    echo CMD ["nginx", "-g", "daemon off;"] >> Dockerfile
    
    echo Dockerfile updated with simpler configuration.
)

if %USE_ALT_PORT%==1 (
    echo.
    echo Step 2.2: Modifying docker-compose.yml to use alternative port
    
    rem Create a temporary file with the modified port
    echo services: > docker-compose.tmp.yml
    echo   frontend: >> docker-compose.tmp.yml
    echo     build: >> docker-compose.tmp.yml
    echo       context: . >> docker-compose.tmp.yml
    echo       dockerfile: Dockerfile >> docker-compose.tmp.yml
    echo     container_name: stagequest-frontend >> docker-compose.tmp.yml
    echo     ports: >> docker-compose.tmp.yml
    echo       - "8080:80" >> docker-compose.tmp.yml
    echo     depends_on: >> docker-compose.tmp.yml
    echo       - api >> docker-compose.tmp.yml
    echo     networks: >> docker-compose.tmp.yml
    echo       - stagequest-network >> docker-compose.tmp.yml
    echo     environment: >> docker-compose.tmp.yml
    echo       - VITE_API_URL=http://localhost:3000 >> docker-compose.tmp.yml
    echo       - VITE_STUDENT_SUPABASE_URL=${VITE_STUDENT_SUPABASE_URL} >> docker-compose.tmp.yml
    echo       - VITE_STUDENT_SUPABASE_ANON_KEY=${VITE_STUDENT_SUPABASE_ANON_KEY} >> docker-compose.tmp.yml
    echo       - REACT_APP_AZURE_CLIENT_ID=${REACT_APP_AZURE_CLIENT_ID} >> docker-compose.tmp.yml
    echo       - REACT_APP_AZURE_TENANT_ID=${REACT_APP_AZURE_TENANT_ID} >> docker-compose.tmp.yml
    echo     restart: unless-stopped >> docker-compose.tmp.yml
    echo. >> docker-compose.tmp.yml
    echo   api: >> docker-compose.tmp.yml
    echo     build: >> docker-compose.tmp.yml
    echo       context: ./server >> docker-compose.tmp.yml
    echo       dockerfile: Dockerfile >> docker-compose.tmp.yml
    echo     container_name: stagequest-api >> docker-compose.tmp.yml
    echo     ports: >> docker-compose.tmp.yml
    echo       - "3000:3000" >> docker-compose.tmp.yml
    echo     environment: >> docker-compose.tmp.yml
    echo       - NODE_ENV=production >> docker-compose.tmp.yml
    echo       - PORT=3000 >> docker-compose.tmp.yml
    echo       - HOST=0.0.0.0 >> docker-compose.tmp.yml
    echo     networks: >> docker-compose.tmp.yml
    echo       - stagequest-network >> docker-compose.tmp.yml
    echo     restart: unless-stopped >> docker-compose.tmp.yml
    echo. >> docker-compose.tmp.yml
    echo networks: >> docker-compose.tmp.yml
    echo   stagequest-network: >> docker-compose.tmp.yml
    echo     driver: bridge >> docker-compose.tmp.yml
    
    move /y docker-compose.tmp.yml docker-compose.yml
    
    echo docker-compose.yml updated to use port 8080 instead of 80.
    echo After build, your app will be available at http://localhost:8080
)

echo.
echo Step 2.3: Creating minimal API server package.json

echo {> server\package.json
echo   "name": "stagequest-api",>> server\package.json
echo   "version": "1.0.0",>> server\package.json
echo   "description": "API server for StageQuest application",>> server\package.json
echo   "main": "index.js",>> server\package.json
echo   "scripts": {>> server\package.json
echo     "start": "node index.js",>> server\package.json
echo     "dev": "nodemon index.js">> server\package.json
echo   },>> server\package.json
echo   "dependencies": {>> server\package.json
echo     "axios": "^1.6.2",>> server\package.json
echo     "cors": "^2.8.5",>> server\package.json
echo     "express": "^4.18.2">> server\package.json
echo   },>> server\package.json
echo   "engines": {>> server\package.json
echo     "node": ">=18.0.0">> server\package.json
echo   }>> server\package.json
echo }>> server\package.json

echo.
echo Step 2.4: Creating simplified API server index.js
echo // Simple Express server with registration endpoint> server\index.js
echo const express = require('express');>> server\index.js
echo const cors = require('cors');>> server\index.js
echo const axios = require('axios');>> server\index.js
echo.>> server\index.js
echo const app = express();>> server\index.js
echo const port = process.env.PORT || 3000;>> server\index.js
echo.>> server\index.js
echo // Middleware>> server\index.js
echo app.use(cors());>> server\index.js
echo app.use(express.json());>> server\index.js
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
echo   if (!name || !company || !email || !password) {>> server\index.js
echo     return res.status(400).json({ >> server\index.js
echo       error: `Missing required fields: ${!name ? 'name' : ''}${!email ? ', email' : ''}${!password ? ', password' : ''}`,>> server\index.js
echo       details: { missingFields: [!name ? 'name' : null, !email ? 'email' : null, !password ? 'password' : null].filter(Boolean) }>> server\index.js
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
echo // Start server>> server\index.js
echo app.listen(port, process.env.HOST || 'localhost', () => {>> server\index.js
echo   console.log(`API server running on port ${port}`);>> server\index.js
echo });>> server\index.js

echo.
echo Step 2.5: Creating optimized API server Dockerfile

echo FROM node:18-alpine> server\Dockerfile
echo.>> server\Dockerfile
echo # Create app directory>> server\Dockerfile
echo WORKDIR /app>> server\Dockerfile
echo.>> server\Dockerfile
echo # Copy package files first>> server\Dockerfile
echo COPY package*.json ./>> server\Dockerfile
echo.>> server\Dockerfile
echo # Install dependencies without any extra configuration>> server\Dockerfile
echo RUN npm install --production>> server\Dockerfile
echo.>> server\Dockerfile
echo # Copy application source>> server\Dockerfile
echo COPY . .>> server\Dockerfile
echo.>> server\Dockerfile
echo # Set production mode>> server\Dockerfile
echo ENV NODE_ENV=production>> server\Dockerfile
echo ENV HOST=0.0.0.0>> server\Dockerfile
echo.>> server\Dockerfile
echo # Default port>> server\Dockerfile
echo EXPOSE 3000>> server\Dockerfile
echo.>> server\Dockerfile
echo # Start server>> server\Dockerfile
echo CMD ["node", "index.js"]>> server\Dockerfile

echo Server configuration files created with simpler Docker setup.

if %SKIP_NPM_INSTALL%==0 (
    echo.
    echo Step 3: Installing npm dependencies
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Error installing npm dependencies!
        if %CONTINUE_ON_ERROR%==0 exit /b %ERRORLEVEL%
    )
) else (
    echo.
    echo Step 3: Skipping npm install
)

if %SKIP_FRONTEND_BUILD%==0 (
    echo.
    echo Step 4: Building frontend
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo Error building frontend!
        if %CONTINUE_ON_ERROR%==0 exit /b %ERRORLEVEL%
    )

    echo.
    echo Step 5: Verifying dist directory contents
    dir dist
) else (
    echo.
    echo Step 4-5: Skipping frontend build
)

echo.
echo Step 6: Building and starting Docker containers
echo Setting Docker build parameters for better performance...
set DOCKER_BUILDKIT=1
set COMPOSE_DOCKER_CLI_BUILD=1
set COMPOSE_HTTP_TIMEOUT=600
echo Starting build with increased timeouts...
docker-compose build --no-cache --progress=plain
if %ERRORLEVEL% NEQ 0 (
    echo Error building Docker containers!
    if %CONTINUE_ON_ERROR%==0 exit /b %ERRORLEVEL%
)

echo.
echo Step 7: Starting containers
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo Error starting containers!
    if %CONTINUE_ON_ERROR%==0 exit /b %ERRORLEVEL%
)

echo.
echo Step 8: Checking container status
timeout /t 10 > nul
docker ps
echo.

echo Step 9: Checking container logs
echo Frontend logs:
docker logs stagequest-frontend --tail 20
echo.

echo API logs:
docker logs stagequest-api --tail 20
echo.

if %USE_ALT_PORT%==1 (
    set "PORT=8080"
) else (
    set "PORT=80"
)

echo ===== Build Complete =====
echo.
echo If successful, your application should be available at:
echo http://localhost:%PORT%
echo.
echo To view logs: docker-compose logs -f
echo To check container status: docker-compose ps
echo.
echo If you're still having issues, try these troubleshooting steps:
echo 1. Run 'docker logs stagequest-api' to see detailed API errors
echo 2. Run 'docker logs stagequest-frontend' to see frontend errors
echo 3. Try rebuilding with: rebuild.bat --fix-frontend --alt-port
echo.
echo To check if port 80 is already in use:
echo netstat -ano | findstr ":80"
echo.
