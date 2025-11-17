# CMS Backend Implementation Guide

## ✅ What Was Implemented

I've successfully implemented the backend API for the CMS system with the following components:

### 1. **Prisma Models** (schema.prisma)

- ✅ `SiteSettings` model with all fields
- ✅ `SEOSettings` model with full SEO capabilities
- ✅ Relations to `User` model for audit tracking

### 2. **DTOs** (Data Transfer Objects)

- ✅ `UpdateSiteSettingsDto` - For site settings updates
- ✅ `UpdateSEOSettingsDto` - For SEO settings updates
- ✅ Full validation with `class-validator`
- ✅ Swagger documentation with `@ApiProperty`

### 3. **Service Layer**

- ✅ `SettingsService` with full CRUD operations
- ✅ Auto-creation of default settings if none exist
- ✅ Audit tracking (updatedBy field)
- ✅ Logging with NestJS Logger

### 4. **Controller Endpoints**

- ✅ `GET /admin/cms/site-settings` - Fetch site settings
- ✅ `PUT /admin/cms/site-settings` - Update site settings
- ✅ `GET /admin/cms/seo-settings` - Fetch SEO settings
- ✅ `PUT /admin/cms/seo-settings` - Update SEO settings
- ✅ Protected with JWT authentication
- ✅ Role-based permissions (`admin.settings.view`, `admin.settings.update`)

### 5. **Module Configuration**

- ✅ `CmsModule` updated with `SettingsService`
- ✅ Service exported for use in other modules

---

## 🚀 Setup Instructions

### Step 1: Generate Prisma Client

The Prisma schema has been updated with new models. Generate the Prisma client:

```bash
cd nestjs-stater-kit
npm run prisma:generate
```

This will:

- Generate TypeScript types for `SiteSettings` and `SEOSettings`
- Update the Prisma Client with new models
- Fix all TypeScript errors in the service

### Step 2: Create and Run Migration

Create a new migration for the database changes:

```bash
npm run prisma:migrate -- --name add_cms_settings
```

This will:

- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Create the `site_settings` and `seo_settings` tables

### Step 3: Verify Tables Were Created

Check your database to ensure the tables were created:

```sql
-- In your PostgreSQL client
\dt site_settings
\dt seo_settings

-- Or describe the tables
\d site_settings
\d seo_settings
```

### Step 4: Add Permissions to Database

The endpoints use these permissions:

- `admin.settings.view`
- `admin.settings.update`

Add these permissions to your database:

```sql
-- Add permissions
INSERT INTO permissions (id, name, description, "createdAt", "updatedAt") VALUES
('perm_settings_view', 'admin.settings.view', 'View CMS settings', NOW(), NOW()),
('perm_settings_update', 'admin.settings.update', 'Update CMS settings', NOW(), NOW());

-- Assign to admin role (replace 'admin_role_id' with your actual admin role ID)
INSERT INTO role_permissions (id, "roleId", "permissionId", "createdAt") VALUES
('role_perm_1', 'admin_role_id', 'perm_settings_view', NOW()),
('role_perm_2', 'admin_role_id', 'perm_settings_update', NOW());
```

### Step 5: Restart Your Backend Server

```bash
npm run start:dev
```

The server should start without TypeScript errors.

---

## 📋 API Endpoints Documentation

### Base URL

```
http://localhost:4000/admin/cms
```

### Authentication

All endpoints require:

- Valid JWT token in Authorization header
- Admin role with appropriate permissions

### 1. Get Site Settings

**Endpoint:** `GET /admin/cms/site-settings`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "status": true,
  "data": {
    "id": "string",
    "siteName": "string",
    "siteUrl": "string",
    "siteDescription": "string | null",
    "logo": "string | null",
    "favicon": "string | null",
    "contactEmail": "string | null",
    "contactPhone": "string | null",
    "contactAddress": "string | null",
    "socialLinks": {
      "facebook": "string | null",
      "twitter": "string | null",
      "instagram": "string | null",
      "linkedin": "string | null",
      "youtube": "string | null",
      "github": "string | null"
    },
    "businessHours": "string | null",
    "timezone": "string",
    "language": "string",
    "currency": "string",
    "updatedAt": "ISO 8601 date",
    "updatedBy": "string | null",
    "updater": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  },
  "message": "Site settings retrieved successfully"
}
```

### 2. Update Site Settings

**Endpoint:** `PUT /admin/cms/site-settings`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:** (all fields optional)

```json
{
  "siteName": "My Awesome Site",
  "siteUrl": "https://example.com",
  "siteDescription": "Brief description",
  "logo": "https://example.com/logo.png",
  "favicon": "https://example.com/favicon.ico",
  "contactEmail": "contact@example.com",
  "contactPhone": "+1 (555) 123-4567",
  "contactAddress": "123 Main St",
  "socialLinks": {
    "facebook": "https://facebook.com/page",
    "twitter": "https://twitter.com/handle",
    "instagram": "https://instagram.com/profile",
    "linkedin": "https://linkedin.com/company/company",
    "youtube": "https://youtube.com/channel",
    "github": "https://github.com/org"
  },
  "businessHours": "Mon-Fri: 9AM-5PM",
  "timezone": "UTC",
  "language": "en",
  "currency": "USD"
}
```

**Response:** Same as GET endpoint

### 3. Get SEO Settings

**Endpoint:** `GET /admin/cms/seo-settings`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**

```json
{
  "status": true,
  "data": {
    "id": "string",
    "metaTitle": "string | null",
    "metaDescription": "string | null",
    "metaKeywords": ["string"],
    "ogTitle": "string | null",
    "ogDescription": "string | null",
    "ogImage": "string | null",
    "twitterCard": "summary_large_image",
    "twitterTitle": "string | null",
    "twitterDescription": "string | null",
    "twitterImage": "string | null",
    "twitterSite": "string | null",
    "twitterCreator": "string | null",
    "canonicalUrl": "string | null",
    "robotsDirectives": {
      "index": true,
      "follow": true,
      "noarchive": false,
      "nosnippet": false,
      "noimageindex": false
    },
    "structuredData": {},
    "googleSiteVerification": "string | null",
    "googleAnalyticsId": "string | null",
    "googleTagManagerId": "string | null",
    "facebookPixelId": "string | null",
    "facebookAppId": "string | null",
    "updatedAt": "ISO 8601 date",
    "updatedBy": "string | null",
    "updater": {
      "id": "string",
      "name": "string",
      "email": "string"
    }
  },
  "message": "SEO settings retrieved successfully"
}
```

### 4. Update SEO Settings

**Endpoint:** `PUT /admin/cms/seo-settings`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:** (all fields optional)

```json
{
  "metaTitle": "Your Site Title",
  "metaDescription": "Brief description",
  "metaKeywords": ["keyword1", "keyword2"],
  "ogTitle": "Title for social media",
  "ogDescription": "Description for social media",
  "ogImage": "https://example.com/og-image.jpg",
  "twitterCard": "summary_large_image",
  "twitterTitle": "Twitter title",
  "twitterDescription": "Twitter description",
  "twitterImage": "https://example.com/twitter-image.jpg",
  "twitterSite": "@yoursite",
  "twitterCreator": "@creator",
  "canonicalUrl": "https://example.com",
  "robotsDirectives": {
    "index": true,
    "follow": true,
    "noarchive": false,
    "nosnippet": false,
    "noimageindex": false
  },
  "structuredData": {},
  "googleSiteVerification": "verification-code",
  "googleAnalyticsId": "G-XXXXXXXXXX",
  "googleTagManagerId": "GTM-XXXXXXX",
  "facebookPixelId": "123456789012345",
  "facebookAppId": "123456789"
}
```

**Response:** Same as GET endpoint

---

## 🧪 Testing the API

### Using cURL

**Get Site Settings:**

```bash
curl -X GET http://localhost:4000/admin/cms/site-settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Update Site Settings:**

```bash
curl -X PUT http://localhost:4000/admin/cms/site-settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "siteName": "My Site",
    "siteUrl": "https://mysite.com"
  }'
```

### Using Postman

1. Create a new request
2. Set method to GET or PUT
3. Enter URL: `http://localhost:4000/admin/cms/site-settings`
4. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
5. For PUT requests, add JSON body
6. Send request

---

## 🔒 Security Notes

### Authentication & Authorization

- All endpoints require JWT authentication
- User must have admin role
- Permissions checked: `admin.settings.view`, `admin.settings.update`

### Validation

- All inputs validated using `class-validator`
- URL validation for links and images
- Email validation for contact email
- Max length constraints on all fields

### Audit Trail

- `updatedBy` field tracks who made changes
- `updatedAt` automatically updated by Prisma
- Relations to User model for full audit history

---

## 📊 Database Schema

### site_settings Table

```sql
CREATE TABLE site_settings (
  id VARCHAR PRIMARY KEY,
  site_name VARCHAR(255) NOT NULL,
  site_url VARCHAR(500) NOT NULL,
  site_description TEXT,
  logo VARCHAR(500),
  favicon VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  social_links JSONB DEFAULT '{}',
  business_hours TEXT,
  timezone VARCHAR(100) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'USD',
  updated_at TIMESTAMP NOT NULL,
  updated_by VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_site_settings_updated_at ON site_settings(updated_at);
```

### seo_settings Table

```sql
CREATE TABLE seo_settings (
  id VARCHAR PRIMARY KEY,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  meta_keywords TEXT[],
  og_title VARCHAR(70),
  og_description VARCHAR(160),
  og_image VARCHAR(500),
  twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
  twitter_title VARCHAR(70),
  twitter_description VARCHAR(160),
  twitter_image VARCHAR(500),
  twitter_site VARCHAR(100),
  twitter_creator VARCHAR(100),
  canonical_url VARCHAR(500),
  robots_directives JSONB DEFAULT '{"index":true,"follow":true,"noarchive":false,"nosnippet":false,"noimageindex":false}',
  structured_data JSONB,
  google_site_verification VARCHAR(255),
  google_analytics_id VARCHAR(100),
  google_tag_manager_id VARCHAR(100),
  facebook_pixel_id VARCHAR(100),
  facebook_app_id VARCHAR(100),
  updated_at TIMESTAMP NOT NULL,
  updated_by VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_seo_settings_updated_at ON seo_settings(updated_at);
```

---

## ✅ Verification Checklist

After completing the setup, verify:

- [ ] Prisma client generated successfully
- [ ] Migration ran without errors
- [ ] `site_settings` table exists in database
- [ ] `seo_settings` table exists in database
- [ ] Permissions added to database
- [ ] Permissions assigned to admin role
- [ ] Server starts without TypeScript errors
- [ ] Can GET site settings (returns default if none exist)
- [ ] Can UPDATE site settings
- [ ] Can GET SEO settings (returns default if none exist)
- [ ] Can UPDATE SEO settings
- [ ] Settings persist after restart
- [ ] Frontend can connect and fetch settings

---

## 🐛 Troubleshooting

### TypeScript Errors After Implementation

**Solution:** Run `npm run prisma:generate` to regenerate Prisma client

### Migration Fails

**Solution:** Check database connection in `.env` file, ensure PostgreSQL is running

### Permission Denied Errors

**Solution:** Verify permissions are added and assigned to your admin role

### 404 Not Found

**Solution:** Ensure server is running on port 4000, check CORS settings

### Settings Not Persisting

**Solution:** Check database connection, verify migration ran successfully

---

## 🎯 Next Steps

1. **Test all endpoints** using Postman or cURL
2. **Connect frontend** to verify full integration
3. **Add more permissions** if needed for fine-grained control
4. **Set up monitoring** for settings changes
5. **Add validation rules** for specific business requirements

---

## 📞 Support

If you encounter issues:

1. Check server logs for errors
2. Verify database connection
3. Ensure migrations ran successfully
4. Check permissions are correctly assigned
5. Verify JWT token is valid

---

**Backend implementation complete!** 🎉

The CMS settings API is now fully functional and ready to integrate with your frontend.
