# CMS Backend Quick Start Guide

## ⚡ Quick Setup (5 minutes)

Follow these steps to get the CMS backend up and running:

### Step 1: Generate Prisma Client (30 seconds)

```bash
cd nestjs-stater-kit
npm run prisma:generate
```

**What this does:**

- Generates TypeScript types for new models
- Updates Prisma Client
- Fixes TypeScript errors

### Step 2: Create and Run Migration (1 minute)

```bash
npm run prisma:migrate -- --name add_cms_settings
```

**What this does:**

- Creates migration file
- Creates `site_settings` table
- Creates `seo_settings` table
- Applies changes to database

### Step 3: Add Permissions (1 minute)

Run the SQL script to add permissions:

```bash
# If using psql
psql -d your_database -f prisma/migrations-manual/add_cms_permissions.sql

# Or copy the SQL from the file and run in your database client
```

**What this does:**

- Adds `admin.settings.view` permission
- Adds `admin.settings.update` permission
- Assigns permissions to admin role

### Step 4: Restart Server (30 seconds)

```bash
npm run start:dev
```

### Step 5: Test the API (1 minute)

Test with cURL or Postman:

```bash
# Get your JWT token first (login as admin)
TOKEN="your_jwt_token_here"

# Test Get Site Settings
curl -X GET http://localhost:4000/admin/cms/site-settings \
  -H "Authorization: Bearer $TOKEN"

# Test Update Site Settings
curl -X PUT http://localhost:4000/admin/cms/site-settings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteName":"My Site","siteUrl":"https://mysite.com"}'
```

---

## 🎯 Expected Endpoints

After setup, these endpoints will be available:

| Method | Endpoint                   | Purpose              |
| ------ | -------------------------- | -------------------- |
| GET    | `/admin/cms/site-settings` | Get site settings    |
| PUT    | `/admin/cms/site-settings` | Update site settings |
| GET    | `/admin/cms/seo-settings`  | Get SEO settings     |
| PUT    | `/admin/cms/seo-settings`  | Update SEO settings  |

---

## ✅ Verification

Confirm everything works:

```bash
# 1. Check if Prisma client has new models
grep -r "SiteSettings" node_modules/.prisma/client/

# 2. Check if tables exist in database
psql -d your_database -c "\dt *settings"

# 3. Check if permissions exist
psql -d your_database -c "SELECT name FROM permissions WHERE name LIKE 'admin.settings.%';"

# 4. Test endpoints
curl http://localhost:4000/admin/cms/site-settings -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Troubleshooting

### Issue: TypeScript errors after migration

**Solution:**

```bash
npm run prisma:generate
# Then restart your IDE/TypeScript server
```

### Issue: Permission denied when accessing endpoints

**Solution:**

```bash
# Check if permissions are assigned to your role
psql -d your_database -c "
SELECT r.name as role, p.name as permission
FROM roles r
JOIN role_permissions rp ON r.id = rp.\"roleId\"
JOIN permissions p ON rp.\"permissionId\" = p.id
WHERE p.name LIKE 'admin.settings.%';
"
```

### Issue: Migration fails

**Solution:**

```bash
# Check database connection
npm run prisma:migrate status

# If needed, reset and retry
npm run prisma:migrate reset
npm run prisma:migrate -- --name add_cms_settings
```

---

## 📝 What Was Added

### Files Created:

1. `prisma/schema.prisma` - Updated with SiteSettings and SEOSettings models
2. `src/cms/dto/site-settings.dto.ts` - Site settings DTO
3. `src/cms/dto/seo-settings.dto.ts` - SEO settings DTO
4. `src/cms/services/settings.service.ts` - Settings service layer
5. `src/cms/cms.controller.ts` - Updated with new endpoints
6. `src/cms/cms.module.ts` - Updated with SettingsService
7. `CMS_BACKEND_SETUP.md` - Detailed setup guide
8. `CMS_QUICK_START.md` - This quick start guide
9. `prisma/migrations-manual/add_cms_permissions.sql` - Permission script

### Database Tables Created:

- `site_settings` - Stores site configuration
- `seo_settings` - Stores SEO configuration

### Permissions Added:

- `admin.settings.view` - View settings
- `admin.settings.update` - Update settings

---

## 🔗 Frontend Integration

Your Next.js frontend is already configured to use these endpoints:

**Frontend API Base:**

```typescript
// In frontend: lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL; // http://localhost:4000
```

**Frontend Hooks:**

```typescript
// Already implemented in frontend
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/use-admin';
import { useSEOSettings, useUpdateSEOSettings } from '@/hooks/use-admin';
```

**Frontend Pages:**

- `/dashboard/admin/cms/site-settings` - Site Settings UI
- `/dashboard/admin/cms/seo-settings` - SEO Settings UI

---

## 🎉 You're Done!

Your CMS backend is now fully functional and integrated with the frontend.

**Next Steps:**

1. Login to your Next.js frontend as admin
2. Navigate to Admin Panel → Site Settings
3. Fill in your site information
4. Navigate to Admin Panel → SEO Settings
5. Configure your SEO settings
6. Click Save Changes

Everything should work seamlessly! 🚀

---

**Need help?** Check the detailed `CMS_BACKEND_SETUP.md` guide.
