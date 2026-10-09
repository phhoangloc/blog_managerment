-- AlterTable
ALTER TABLE `admin` ADD COLUMN `avatarId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatarId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `admin_avatarId_idx` ON `admin`(`avatarId`);

-- CreateIndex
CREATE INDEX `user_avatarId_idx` ON `user`(`avatarId`);

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `admin_avatarId_fkey` FOREIGN KEY (`avatarId`) REFERENCES `file`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_avatarId_fkey` FOREIGN KEY (`avatarId`) REFERENCES `file`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
