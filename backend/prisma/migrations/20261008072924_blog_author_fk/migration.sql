/*
  Warnings:

  - You are about to drop the column `authorRole` on the `blog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `blog_authorRole_authorId_idx` ON `blog`;

-- AlterTable
ALTER TABLE `blog` DROP COLUMN `authorRole`;

-- CreateIndex
CREATE INDEX `blog_authorId_idx` ON `blog`(`authorId`);

-- AddForeignKey
ALTER TABLE `blog` ADD CONSTRAINT `blog_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
