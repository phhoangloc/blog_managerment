import multer from 'multer';

// Keep the file in memory; FileService decides the final name and location
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');
