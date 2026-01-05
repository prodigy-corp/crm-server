-- DropForeignKey
ALTER TABLE "message_rooms" DROP CONSTRAINT "message_rooms_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "message_rooms" DROP CONSTRAINT "message_rooms_senderId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- DropIndex
DROP INDEX "message_rooms_senderId_receiverId_bookingId_key";

-- AlterTable
ALTER TABLE "message_rooms" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "senderId" DROP NOT NULL,
ALTER COLUMN "receiverId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "receiverId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "message_room_members" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_room_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_room_members_roomId_idx" ON "message_room_members"("roomId");

-- CreateIndex
CREATE INDEX "message_room_members_userId_idx" ON "message_room_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "message_room_members_roomId_userId_key" ON "message_room_members"("roomId", "userId");

-- CreateIndex
CREATE INDEX "message_rooms_creatorId_idx" ON "message_rooms"("creatorId");

-- AddForeignKey
ALTER TABLE "message_rooms" ADD CONSTRAINT "message_rooms_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_rooms" ADD CONSTRAINT "message_rooms_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_rooms" ADD CONSTRAINT "message_rooms_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_room_members" ADD CONSTRAINT "message_room_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "message_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_room_members" ADD CONSTRAINT "message_room_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
