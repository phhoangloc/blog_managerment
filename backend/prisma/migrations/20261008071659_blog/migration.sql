-- CreateTable
CREATE TABLE `blog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `detail` TEXT NOT NULL DEFAULT '',
    `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    `draft` BOOLEAN NOT NULL DEFAULT true,
    `coverId` INTEGER NULL,
    `authorRole` VARCHAR(191) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_slug_key`(`slug`),
    INDEX `blog_coverId_idx`(`coverId`),
    INDEX `blog_authorRole_authorId_idx`(`authorRole`, `authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog` ADD CONSTRAINT `blog_coverId_fkey` FOREIGN KEY (`coverId`) REFERENCES `file`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
