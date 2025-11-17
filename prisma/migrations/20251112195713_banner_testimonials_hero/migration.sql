-- CreateTable
CREATE TABLE "hero_sections" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(300),
    "description" TEXT,
    "primaryButtonText" VARCHAR(50),
    "primaryButtonUrl" VARCHAR(500),
    "secondaryButtonText" VARCHAR(50),
    "secondaryButtonUrl" VARCHAR(500),
    "backgroundImage" VARCHAR(500),
    "backgroundVideo" VARCHAR(500),
    "overlayOpacity" INTEGER,
    "textAlignment" VARCHAR(10) NOT NULL DEFAULT 'left',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "message" VARCHAR(500),
    "type" VARCHAR(20) NOT NULL,
    "backgroundColor" VARCHAR(7),
    "textColor" VARCHAR(7),
    "buttonText" VARCHAR(50),
    "buttonUrl" VARCHAR(500),
    "buttonColor" VARCHAR(7),
    "icon" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDismissible" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "position" VARCHAR(100),
    "company" VARCHAR(100),
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "avatar" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_sections_isActive_idx" ON "hero_sections"("isActive");

-- CreateIndex
CREATE INDEX "hero_sections_displayOrder_idx" ON "hero_sections"("displayOrder");

-- CreateIndex
CREATE INDEX "hero_sections_createdAt_idx" ON "hero_sections"("createdAt");

-- CreateIndex
CREATE INDEX "banners_isActive_idx" ON "banners"("isActive");

-- CreateIndex
CREATE INDEX "banners_type_idx" ON "banners"("type");

-- CreateIndex
CREATE INDEX "banners_startDate_idx" ON "banners"("startDate");

-- CreateIndex
CREATE INDEX "banners_endDate_idx" ON "banners"("endDate");

-- CreateIndex
CREATE INDEX "banners_displayOrder_idx" ON "banners"("displayOrder");

-- CreateIndex
CREATE INDEX "banners_createdAt_idx" ON "banners"("createdAt");

-- CreateIndex
CREATE INDEX "testimonials_isActive_idx" ON "testimonials"("isActive");

-- CreateIndex
CREATE INDEX "testimonials_isFeatured_idx" ON "testimonials"("isFeatured");

-- CreateIndex
CREATE INDEX "testimonials_rating_idx" ON "testimonials"("rating");

-- CreateIndex
CREATE INDEX "testimonials_displayOrder_idx" ON "testimonials"("displayOrder");

-- CreateIndex
CREATE INDEX "testimonials_createdAt_idx" ON "testimonials"("createdAt");

-- AddForeignKey
ALTER TABLE "hero_sections" ADD CONSTRAINT "hero_sections_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
