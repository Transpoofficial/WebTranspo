# TRANSPO - Deployment Guide

## Deployment Overview

TRANSPO is designed to be deployed using Docker containers with Nginx as a reverse proxy and automated SSL certificate management via Let's Encrypt (Certbot).

## Prerequisites

### System Requirements

**Minimum**:
- 2 CPU cores
- 4 GB RAM
- 40 GB SSD storage
- Ubuntu 20.04 LTS or later

**Recommended**:
- 4 CPU cores
- 8 GB RAM
- 80 GB SSD storage
- Ubuntu 22.04 LTS

### Required Software

- Docker 20.10+
- Docker Compose 2.0+
- Git
- Node.js 20+ (for local development)
- pnpm 8+ (for local development)

### External Services

- **MySQL Database** (version 8.0+)
  - Can be hosted on the same server or separate database server
  - TiDB Cloud is also supported (MySQL-compatible)
  
- **Supabase Account**
  - For file storage (payment proofs, images)
  - Free tier available
  
- **Google Cloud Account**
  - Google Maps API key
  - Optional: Google OAuth credentials
  
- **SMTP Server**
  - For sending transactional emails
  - Options: Gmail, Mailtrap, SendGrid, AWS SES

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/Transpoofficial/WebTranspo.git
cd WebTranspo
```

### 2. Configure Environment Variables

Create `.env` file in the project root:

```bash
# Database
DATABASE_URL="mysql://username:password@host:3306/database_name"

# NextAuth
NEXTAUTH_SECRET="generate-a-strong-random-secret-here"
NEXTAUTH_URL="https://yourdomain.com"

# Supabase (File Storage)
SUPABASE_HOST="your-project-id"
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_BUCKET="your-bucket-name"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_URL="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&callback=console.debug&libraries=maps,marker&v=beta"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Analytics & SEO (Optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
NEXT_PUBLIC_FB_PIXEL_ID="your-pixel-id"
NEXT_PUBLIC_HOTJAR_ID="your-hotjar-id"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

# Site Verification (Optional)
GOOGLE_SITE_VERIFICATION="your-verification-code"
YANDEX_SITE_VERIFICATION="your-verification-code"
YAHOO_SITE_VERIFICATION="your-verification-code"

# Default Admin Password for Seeding
ACCOUNT_DEFAULT_PASSWORD="SecureAdminPassword123!"
```

### 3. Generating Secrets

**NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

**Gmail App Password**:
1. Enable 2FA on your Google account
2. Go to Google Account > Security > App passwords
3. Generate app password for "Mail"

## Database Setup

### Option 1: Local MySQL

**Install MySQL**:
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**Create Database**:
```sql
CREATE DATABASE transpo_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'transpo'@'localhost' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON transpo_production.* TO 'transpo'@'localhost';
FLUSH PRIVILEGES;
```

**Update DATABASE_URL**:
```
DATABASE_URL="mysql://transpo:strong-password@localhost:3306/transpo_production"
```

### Option 2: TiDB Cloud (Recommended for Scalability)

1. Sign up at https://tidbcloud.com
2. Create a new cluster
3. Download the SSL certificate (`isrgrootx1.pem`)
4. Update DATABASE_URL:
```
DATABASE_URL="mysql://user.root:password@gateway.region.prod.aws.tidbcloud.com:4000/database?sslaccept=strict&sslca=isrgrootx1.pem"
```

### Run Migrations

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Seed initial data (admin user, vehicle types)
pnpm prisma db seed
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Note down project URL and service role key

### 2. Create Storage Bucket

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('transpo-files', 'transpo-files', true);
```

**Or via Dashboard**:
1. Go to Storage
2. Create new bucket: `transpo-files`
3. Set as public
4. Configure CORS if needed

### 3. Storage Policies

```sql
-- Allow public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'transpo-files' );

-- Allow authenticated upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'transpo-files' );
```

## Google Cloud Setup

### 1. Enable Google Maps API

1. Go to Google Cloud Console
2. Create new project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
   - Distance Matrix API
4. Create API key
5. Restrict API key:
   - Application restrictions: HTTP referrers
   - Add your domain: `https://yourdomain.com/*`
   - API restrictions: Select only the APIs listed above

### 2. Google OAuth (Optional)

1. Go to Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   - `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t transpo-web:latest .
```

### 2. Configure Nginx

Edit `nginx.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/lib/letsencrypt;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Configure Docker Compose

`docker-compose.yaml` is already configured. Verify settings:

```yaml
services:
  web:
    build: .
    container_name: web_app
    restart: always
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    networks:
      - webnet

  nginx:
    image: nginx:stable-alpine
    container_name: nginx_proxy
    restart: always
    depends_on:
      - web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./data/certbot/www:/var/lib/letsencrypt
      - ./data/certbot/conf:/etc/letsencrypt
    networks:
      - webnet

  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./data/certbot/www:/var/lib/letsencrypt
      - ./data/certbot/conf:/etc/letsencrypt
    entrypoint: >
      sh -c "trap exit TERM;
      while :; do
        certbot renew --webroot -w /var/lib/letsencrypt;
        sleep 12h & wait $${!}; 
      done"

networks:
  webnet:
```

### 4. Initial SSL Certificate

**First-time setup** (before starting containers):

```bash
# Create directories
mkdir -p data/certbot/www
mkdir -p data/certbot/conf

# Start nginx temporarily
docker-compose up -d nginx

# Obtain certificate
docker run -it --rm \
  -v $(pwd)/data/certbot/www:/var/lib/letsencrypt \
  -v $(pwd)/data/certbot/conf:/etc/letsencrypt \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/lib/letsencrypt \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d yourdomain.com \
  -d www.yourdomain.com

# Stop nginx
docker-compose down
```

### 5. Start All Services

```bash
docker-compose up -d
```

### 6. Verify Deployment

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f web

# Check Nginx logs
docker-compose logs -f nginx
```

## Post-Deployment

### 1. Verify Application

- Visit `https://yourdomain.com`
- Test login with seeded admin account
- Create a test order
- Verify email sending

### 2. Create Admin Account

```bash
# Connect to running container
docker exec -it web_app sh

# Inside container, use Prisma Studio
npx prisma studio
```

Or use the signup endpoint with SUPER_ADMIN privileges.

### 3. Configure DNS

Point your domain to the server IP:

```
A Record: yourdomain.com → Server IP
A Record: www.yourdomain.com → Server IP
```

### 4. Security Checklist

- ✅ HTTPS enabled with valid SSL certificate
- ✅ Environment variables secured (not in git)
- ✅ Database password is strong
- ✅ Firewall configured (allow 80, 443, 22 only)
- ✅ SSH key-based authentication enabled
- ✅ Regular backups configured
- ✅ API keys restricted by domain/IP

## Monitoring & Maintenance

### Container Management

```bash
# View logs
docker-compose logs -f [service]

# Restart service
docker-compose restart [service]

# Stop all services
docker-compose down

# Update and restart
git pull origin main
docker-compose build
docker-compose up -d
```

### Database Backups

**Automated backup script** (`backup.sh`):

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="transpo_production"

mysqldump -u transpo -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Cron job**:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### SSL Certificate Renewal

Certbot container automatically renews certificates every 12 hours.

**Manual renewal**:
```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

### Log Rotation

Configure logrotate for Docker logs:

```bash
# /etc/logrotate.d/docker-logs
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

## Scaling Considerations

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable Redis for session storage

### Horizontal Scaling
- Load balancer (Nginx, HAProxy)
- Multiple app instances
- Database read replicas
- CDN for static assets

### Performance Optimization
- Enable HTTP/2
- Gzip compression
- Browser caching
- Database connection pooling
- Image optimization

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs web

# Common issues:
# - Database connection failed
# - Missing environment variables
# - Port conflicts
```

### Database Connection Issues

```bash
# Test connection
docker exec -it web_app sh
npx prisma db pull

# Check MySQL
mysql -u transpo -p -h localhost
```

### SSL Certificate Issues

```bash
# Check certificate
docker-compose exec nginx cat /etc/letsencrypt/live/yourdomain.com/fullchain.pem

# Renew manually
docker-compose run --rm certbot renew --force-renewal
```

### Email Not Sending

- Verify SMTP credentials
- Check firewall (port 587/465)
- Test with Mailtrap for development
- Check application logs

### High Memory Usage

```bash
# Check container stats
docker stats

# Restart containers
docker-compose restart
```

## Rollback Procedure

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and start
docker-compose build
docker-compose up -d

# If database migration issue, rollback migration
pnpm prisma migrate resolve --rolled-back <migration_name>
```

## CI/CD Integration

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /path/to/WebTranspo
            git pull origin main
            docker-compose build
            docker-compose up -d
```

## Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate obtained
- [ ] DNS records configured
- [ ] Admin account created
- [ ] Email sending tested
- [ ] Payment flow tested
- [ ] Google Maps working
- [ ] File uploads working
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Error logging configured
- [ ] Performance tested
- [ ] Security audit completed

## Support

For deployment issues:
- Check GitHub Issues
- Contact: admin@transpo.id
- Documentation: https://transpo.id/docs
