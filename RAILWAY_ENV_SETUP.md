# Railway Environment Variables Setup

## 🚨 **CRITICAL: Required Environment Variables for Railway Deployment**

The application is failing because these environment variables are missing. You MUST set these in your Railway project dashboard.

## 📋 **Required Environment Variables**

### **1. Database Configuration (Choose ONE option)**

#### **Option A: DATABASE_URL (Recommended for Railway)**
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```
- **Get this from Railway PostgreSQL service**
- **Go to your Railway project → PostgreSQL → Connect → Connection URL**

#### **Option B: Individual Database Parameters**
```bash
HOST=your_postgres_host
PORT=5432
USER=your_postgres_user
PASSWORD=your_postgres_password
DATABASE=your_database_name
```

### **2. JWT Configuration**
```bash
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
```

### **3. Razorpay Configuration**
```bash
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### **4. Server Configuration**
```bash
PORT=3000
NODE_ENV=production
```

### **5. File Upload Configuration**
```bash
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### **6. CORS Configuration**
```bash
CORS_ORIGIN=https://yourdomain.com
```

### **7. Security Configuration**
```bash
BCRYPT_ROUNDS=12
```

## 🔧 **How to Set Environment Variables in Railway**

### **Step 1: Go to Railway Dashboard**
1. Open [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on your service (the one with the Dockerfile)

### **Step 2: Add Environment Variables**
1. Click on the **"Variables"** tab
2. Click **"New Variable"**
3. Add each variable one by one

### **Step 3: Set Database URL (Most Important)**
1. Go to your **PostgreSQL service** in Railway
2. Click **"Connect"**
3. Copy the **"Connection URL"**
4. Set it as `DATABASE_URL` in your main service

## 🗄️ **Database Setup in Railway**

### **1. Add PostgreSQL Service**
1. In your Railway project, click **"New Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for it to be created

### **2. Get Connection Details**
1. Click on the PostgreSQL service
2. Go to **"Connect"** tab
3. Copy the **"Connection URL"**
4. Use this as your `DATABASE_URL`

## ✅ **Verification Steps**

### **1. Check Environment Variables**
After setting all variables, your Railway service should show:
- ✅ All required variables are set
- ✅ No missing variable errors

### **2. Check Health Endpoint**
Once deployed, test:
```
https://your-app.railway.app/health
```
Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-08-13T...",
  "uptime": 123.45
}
```

### **3. Check Database Connection**
The application should start without database connection errors.

## 🚨 **Common Issues and Solutions**

### **Issue 1: "Missing required environment variable: HOST"**
**Solution**: Set `DATABASE_URL` in Railway environment variables

### **Issue 2: Health check failing**
**Solution**: The health endpoint is now added to the application

### **Issue 3: Database connection failed**
**Solution**: Verify `DATABASE_URL` is correct and PostgreSQL service is running

### **Issue 4: JWT errors**
**Solution**: Set `JWT_SECRET` and `JWT_EXPIRES_IN`

## 📝 **Complete Environment Variables Example**

```bash
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway

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

## 🔄 **After Setting Environment Variables**

1. **Redeploy** your service in Railway
2. **Monitor logs** for any remaining errors
3. **Test health endpoint** to verify deployment
4. **Check database connection** in logs

## 📞 **Need Help?**

If you still encounter issues:
1. Check Railway build logs
2. Verify all environment variables are set
3. Ensure PostgreSQL service is running
4. Check application logs for specific error messages
