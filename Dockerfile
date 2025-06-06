# Simple nginx-based Dockerfile 
FROM nginx:alpine 
 
# Install debugging tools 
RUN apk add --no-cache curl bash 
 
# Copy pre-built files to nginx html directory 
COPY dist /usr/share/nginx/html 
 
# Create env-config.js file 
RUN echo 'window.ENV = {' > /usr/share/nginx/html/env-config.js && \ 
    echo '  "VITE_API_URL": "http://localhost:3000",' >> /usr/share/nginx/html/env-config.js && \ 
    echo '  "IS_DOCKER": true,' >> /usr/share/nginx/html/env-config.js && \ 
    echo '  "VITE_STUDENT_SUPABASE_URL": "https://merambntyjutvpocjyin.supabase.co",' >> /usr/share/nginx/html/env-config.js && \ 
    echo '  "VITE_STUDENT_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcmFtYm50eWp1dHZwb2NqeWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTIyNTMsImV4cCI6MjA2MTI4ODI1M30.NSB7wKx5AKND5jK-PTKY-AQRVHmpxtCBGaIsEUuQ0MI",' >> /usr/share/nginx/html/env-config.js && \ 
    echo '  "REACT_APP_AZURE_CLIENT_ID": "dad8c5ba-b384-42da-946e-3bc8ebfdb1d2",' >> /usr/share/nginx/html/env-config.js && \ 
    echo '  "REACT_APP_AZURE_TENANT_ID": "748c584f-0cee-4bb9-addb-f12ec194e7c9"' >> /usr/share/nginx/html/env-config.js && \ 
    echo '};' >> /usr/share/nginx/html/env-config.js 
 
# Configure nginx 
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \ 
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \ 
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \ 
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \ 
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \ 
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \ 
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \ 
    echo '    }' >> /etc/nginx/conf.d/default.conf && \ 
    echo '    location /health {' >> /etc/nginx/conf.d/default.conf && \ 
    echo '        access_log off;' >> /etc/nginx/conf.d/default.conf && \ 
    echo '        add_header Content-Type text/plain;' >> /etc/nginx/conf.d/default.conf && \ 
    echo '        return 200 "healthy";' >> /etc/nginx/conf.d/default.conf && \ 
    echo '    }' >> /etc/nginx/conf.d/default.conf && \ 
    echo '}' >> /etc/nginx/conf.d/default.conf 
 
# Expose port 80 
EXPOSE 80 
 
# Default command 
CMD ["nginx", "-g", "daemon off;"] 
