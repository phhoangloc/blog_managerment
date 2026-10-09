-- Admins no longer have an avatar
ALTER TABLE `admin` DROP FOREIGN KEY `admin_avatarId_fkey`;
DROP INDEX `admin_avatarId_idx` ON `admin`;
ALTER TABLE `admin` DROP COLUMN `avatarId`;
