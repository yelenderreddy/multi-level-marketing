# Production Deployment Guide for MLM Backend

This guide covers deploying the NestJS backend to Railway using Docker.

## 🚀 Quick Deploy to Railway

### 1. Prerequisites
- Railway account
- GitHub repository connected to Railway
- PostgreSQL database (Railway provides this)

### 2. Railway Deployment Steps

1. **Connect Repository**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Build Settings**
   - Railway will automatically detect the Dockerfile
   - Set the following environment variables in Railway:

#### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Server
PORT=3000
NODE_ENV=production

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
CORS_ORIGIN=https://yourdomain.com

# Security
BCRYPT_ROUNDS=12
```

3. **Deploy**
   - Railway will automatically build and deploy your application
   - Monitor the build logs for any issues

## 🐳 Local Docker Development

### Build and Run Locally
```bash
# Build the Docker image
docker build -t mlm-backend .

# Run with docker-compose (includes PostgreSQL)
docker-compose up -d

# Or run standalone
docker run -p 3000:3000 --env-file .env mlm-backend
```

### Docker Commands
```bash
# Build image
docker build -t mlm-backend .

# Run container
docker run -d \
  --name mlm-backend \
  -p 3000:3000 \
  --env-file .env \
  mlm-backend

# View logs
docker logs -f mlm-backend

# Stop container
docker stop mlm-backend

# Remove container
docker rm mlm-backend
```

## 🔧 Dockerfile Features

### Multi-Stage Build
- **Stage 1 (deps)**: Install production dependencies
- **Stage 2 (builder)**: Build the TypeScript application
- **Stage 3 (runtime)**: Production runtime with minimal footprint

### Security Features
- Non-root user (`nestjs`)
- Minimal Alpine Linux base
- Proper file permissions
- Signal handling with `dumb-init`

### Performance Optimizations
- Layer caching for dependencies
- Multi-stage build to reduce final image size
- Health checks for monitoring
- Proper signal handling

## 📊 Monitoring and Health Checks

### Health Check Endpoint
The application includes a health check at `/health` that Railway will monitor.

### Railway Monitoring
- Automatic health checks every 30 seconds
- Restart policy on failure
- Build logs and runtime logs available in dashboard

## 🗄️ Database Setup

### Railway PostgreSQL
1. Add PostgreSQL service to your project
2. Copy the connection string to `DATABASE_URL`
3. The application will automatically connect

### Local PostgreSQL
```bash
# Using docker-compose
docker-compose up postgres

# Or standalone
docker run -d \
  --name postgres \
  -e POSTGRES_DB=mlm_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine
```

## 📁 File Uploads

### Persistent Storage
- Uploads directory is created in the container
- For Railway, consider using external storage (AWS S3, Cloudinary)
- Local development uses volume mounting

### File Size Limits
- Default: 5MB (`MAX_FILE_SIZE=5242880`)
- Configure in environment variables

## 🔒 Security Considerations

### Production Checklist
- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload validation
- [ ] Environment variables secured

### Environment Variables
Never commit `.env` files to version control. Use Railway's environment variable management.

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker build logs
   - Verify all dependencies in package.json
   - Ensure TypeScript compilation succeeds

2. **Runtime Errors**
   - Check application logs in Railway dashboard
   - Verify environment variables are set correctly
   - Check database connectivity

3. **Health Check Failures**
   - Ensure `/health` endpoint exists
   - Check if application is listening on correct port
   - Verify internal health check logic

### Debug Commands
```bash
# Check container status
docker ps -a

# View container logs
docker logs <container_id>

# Execute commands in container
docker exec -it <container_id> sh

# Check container resources
docker stats <container_id>
```

## 📈 Scaling

### Railway Auto-Scaling
- Railway automatically scales based on traffic
- Configure scaling rules in Railway dashboard
- Monitor resource usage

### Manual Scaling
```bash
# Scale horizontally
docker-compose up --scale app=3

# Scale vertically (in Railway dashboard)
# Adjust CPU and memory allocation
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [NestJS Production](https://docs.nestjs.com/techniques/performance)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)

## 🆘 Support

For deployment issues:
1. Check Railway build logs
2. Verify environment variables
3. Test locally with Docker
4. Check application logs
5. Contact Railway support if needed
