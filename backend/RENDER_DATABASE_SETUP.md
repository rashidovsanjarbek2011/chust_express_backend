# Render Database Connection - Complete Setup Guide

## Problem Summary
Database connection failing with:
- `Can't reach database server`
- `SSL connection has been closed unexpectedly`
- `Server has closed the connection`
- `Connection pool timeout error`

## Root Causes
1. **Wrong DATABASE_URL format** - Not using correct host/port combination
2. **Missing SSL configuration** - Render requires SSL but it wasn't configured
3. **Environment variables not synced** - Changes made locally not reflected on Render
4. **Database credentials incorrect** - Password or username mismatch

---

## CRITICAL - Setting DATABASE_URL on Render Dashboard

✅ **YOU MUST DO THIS ON RENDER DASHBOARD:**

1. **Log in to Render Dashboard**
   - Go to https://dashboard.render.com

2. **Select Your Backend Service**
   - Click on your backend (`chust-express-backend` or similar)

3. **Go to Environment Variables**
   - Click "Environment" tab
   - Scroll to "Environment Variables"

4. **Update DATABASE_URL**
   - **FIND:** Any existing `DATABASE_URL` variable
   - **DELETE IT** (optional, can update instead)
   - **CREATE NEW** with this value:

   ```
   postgresql://admin_chust_express:<PASSWORD>@dpg-d6ipjgpaae7s73cllpig-a.frankfurt-postgres.render.com:5433/chust_express_web?schema=public&sslmode=require
   ```

   🔑 Replace `<PASSWORD>` with the actual password from your database credentials.

5. **Save Changes**
   - Click "Save"
   - Render will redeploy automatically

6. **Monitor Deployment**
   - Go to "Deploys" tab
   - Wait for new deployment to complete
   - Check logs for:
     ```
     ✅ PostgreSQL ulandi
     ✅ Server 5000-portda ishga tushdi
     ```

---

## DATABASE_URL Format Guide

### Anatomy of the Connection String:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require
```

**Your specific values:**
- **USERNAME:** `admin_chust_express`
- **PASSWORD:** *(get from Render dashboard database page)*
- **HOST:** `dpg-d6ipjgpaae7s73cllpig-a.frankfurt-postgres.render.com` 
- **PORT:** `5433` ← **IMPORTANT: Use 5433 for pool mode, NOT 5432**
- **DATABASE:** `chust_express_web`
- **Parameters:** `?schema=public&sslmode=require`

### Two Connection Options:
| Port | Mode | Use Case | Connection Pool |
|------|------|----------|-----------------|
| **5433** | Pool Mode (pgBouncer) | **✅ Recommended for production** | Managed by Render |
| 5432 | Direct Connection | Development/testing | Limited |

---

## Finding Your Database Password

1. Go to https://dashboard.render.com
2. Select your PostgreSQL database
3. Look for "Connections" section
4. You'll see something like:
   ```
   postgresql://admin_chust_express:PASSWORD@host:5433/chust_express_web
   ```
5. Copy the full URL and use it for DATABASE_URL

---

## Verifying Local Setup (.env file)

Your local `.env` file should look like:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://admin_chust_express:PASSWORD@dpg-d6ipjgpaae7s73cllpig-a.frankfurt-postgres.render.com:5433/chust_express_web?schema=public&sslmode=require"
MANAGER_CODE="MANAGER-SECRET-2026"
```

---

## Testing the Connection

After updating Render:

```bash
# Wait for deployment to complete on Render
# Then check logs in Render dashboard

# If deploying from this machine, use:
npm start

# Expected success logs:
# ✅ PostgreSQL ulandi
# ✅ Server 5000-portda ishga tushdi (Socket.io ready)
```

---

## If Still Not Working

1. **Verify password** - Copy from Render dashboard exactly (include all special characters)
2. **Check database is running** - Render PostgreSQL tab shows green "Active" status
3. **Check Render logs** - Look for SSL or connection errors
4. **Try simpler connection** - Temporarily use just:
   ```
   postgresql://admin_chust_express:PASSWORD@hostname:5433/chust_express_web
   ```
5. **Contact Render support** - If database won't connect at all

---

## Files Already Updated For This Fix

✅ `server.js` - Added Prisma logging and error handling  
✅ `config/db.js` - Optimized Prisma configuration  
✅ `RENDER_FIX.md` - Detailed guide (this directory)  
✅ `QUICK_FIX.md` - Quick reference  
✅ `.env.example` - Configuration template

---

## Key Points to Remember

- 🔴 **DO NOT commit** `.env` files with credentials to git
- 🟢 **DO use** Render Dashboard to set environment variables
- 🔴 **DO NOT use** port 5432 in production (limited connections)
- 🟢 **DO use** port 5433 (pool mode) for better reliability
- 🔴 **DO NOT ignore** `sslmode=require` parameter
- 🟢 **DO wait** for Render deployment to complete after changes

---

## Emergency SQL Commands (if connection still fails)

If you need to run commands manually through Render's dashboard SQL tool:

```sql
-- Add notes column to Order if missing
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS notes TEXT;

-- Check tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema='public';

-- Verify DeliveryType has data
SELECT id, "typeName", "basePrice" FROM "DeliveryType";
```

---

**Next Step:** Update the DATABASE_URL on Render Dashboard now!
