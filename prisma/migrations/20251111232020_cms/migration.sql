-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteName" VARCHAR(255) NOT NULL,
    "siteUrl" VARCHAR(500) NOT NULL,
    "siteDescription" TEXT,
    "logo" VARCHAR(500),
    "favicon" VARCHAR(500),
    "contactEmail" VARCHAR(255),
    "contactPhone" VARCHAR(50),
    "contactAddress" TEXT,
    "socialLinks" JSONB DEFAULT '{}',
    "businessHours" TEXT,
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_settings" (
    "id" TEXT NOT NULL,
    "metaTitle" VARCHAR(70),
    "metaDescription" VARCHAR(160),
    "metaKeywords" TEXT[],
    "ogTitle" VARCHAR(70),
    "ogDescription" VARCHAR(160),
    "ogImage" VARCHAR(500),
    "twitterCard" VARCHAR(50) DEFAULT 'summary_large_image',
    "twitterTitle" VARCHAR(70),
    "twitterDescription" VARCHAR(160),
    "twitterImage" VARCHAR(500),
    "twitterSite" VARCHAR(100),
    "twitterCreator" VARCHAR(100),
    "canonicalUrl" VARCHAR(500),
    "robotsDirectives" JSONB DEFAULT '{"index":true,"follow":true,"noarchive":false,"nosnippet":false,"noimageindex":false}',
    "structuredData" JSONB,
    "googleSiteVerification" VARCHAR(255),
    "googleAnalyticsId" VARCHAR(100),
    "googleTagManagerId" VARCHAR(100),
    "facebookPixelId" VARCHAR(100),
    "facebookAppId" VARCHAR(100),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_settings_updatedAt_idx" ON "site_settings"("updatedAt");

-- CreateIndex
CREATE INDEX "seo_settings_updatedAt_idx" ON "seo_settings"("updatedAt");

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
