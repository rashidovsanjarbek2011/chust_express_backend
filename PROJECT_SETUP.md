# Project Setup Guide

## 🚀 Quick Setup Instructions

### 1. Backend Setup

1. **Create .env file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Update .env with your actual values**:
   - Replace `PASSWORD` with your actual database password
   - Generate secure secrets for `JWT_SECRET` and `MIGRATE_SECRET`
   - Update `MANAGER_CODE` if needed

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run database migrations** (if needed):
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

### 2. Frontend Panels Setup

For each frontend panel (admin-panel, manager-panel, extra-panel, front/my-electron-app):

1. **Create .env file**:
   ```bash
   cd [panel-name]
   cp .env.example .env
   ```

2. **Update API URL** (optional):
   - For local development: `VITE_API_BASE_URL="http://localhost:5000"`
   - For production: Keep the default Render URL

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://admin_chust_express:YOUR_PASSWORD@dpg-d6ipjgpaae7s73cllpig-a.frankfurt-postgres.render.com:5433/chust_express_web?schema=public"
PORT=5000
NODE_ENV=production
JWT_SECRET="your-super-secret-jwt-key"
MIGRATE_SECRET="your-migration-secret-key"
MANAGER_CODE="MANAGER-SECRET-2026"
SSL_MODE="require"
```

### Frontend Panels (.env)
```env
VITE_API_BASE_URL="https://chust-express-backend.onrender.com"
```

## 🐛 What Was Fixed

### ✅ Database Connection Issues
- Added missing environment variables to `.env.example`
- Fixed hardcoded database credentials in scripts
- Improved error handling for connection issues

### ✅ Authentication Issues
- Fixed auth middleware Prisma client duplication
- Added proper error handling for missing database connection
- Secured JWT and migration secrets

### ✅ Frontend Configuration
- Standardized API URL configuration across all panels
- Created `.env.example` files for all frontend applications
- Removed hardcoded URLs and replaced with environment variables

### ✅ Security Improvements
- Removed exposed database credentials from scripts
- Added environment variable validation
- Improved secret management

## 🌐 Access Points

- **Backend API**: `https://chust-express-backend.onrender.com`
- **Admin Panel**: `https://your-admin-panel-url`
- **Manager Panel**: `https://your-manager-panel-url`
- **Extra Panel**: `https://your-extra-panel-url`
- **Front App**: `https://your-front-app-url`

## 📋 Common Issues & Solutions

### Database Connection Errors
- Ensure `.env` file exists with correct `DATABASE_URL`
- Check that the database password is correct
- Verify port 5433 is used (Render pool mode)

### Frontend API Connection Issues
- Check that frontend `.env` files point to correct backend URL
- Ensure backend is running and accessible
- Check CORS configuration in backend

### Authentication Issues
- Verify `JWT_SECRET` is set in backend `.env`
- Check that tokens are being sent correctly in headers
- Ensure user roles are properly configured

## 🚀 Deployment Notes

### Render Deployment
1. Update environment variables in Render dashboard
2. Use the "Internal Connections" database URL (port 5433)
3. Set all required environment variables
4. Restart the service after configuration changes

### Local Development
1. Use `http://localhost:5000` for backend API URL
2. Ensure all services are running on correct ports
3. Check that database is accessible from local environment

## 📞 Support

If you encounter issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure database connection is working
4. Check that all services are running on expected ports

---

**Project is now ready for use! 🎉**
