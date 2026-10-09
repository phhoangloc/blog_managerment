-- file.userId (owner) replaces uploaderRole + uploaderId; data is copied for user-owned files.
-- Legacy files uploaded by an admin keep userId = NULL.
ALTER TABLE `file` ADD COLUMN `userId` INTEGER NULL;

UPDATE `file` SET `userId` = `uploaderId`
WHERE `uploaderRole` = 'user' AND `uploaderId` IN (SELECT `id` FROM `user`);

ALTER TABLE `file` DROP COLUMN `uploaderId`, DROP COLUMN `uploaderRole`;

CREATE INDEX `file_userId_idx` ON `file`(`userId`);

ALTER TABLE `file` ADD CONSTRAINT `file_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
