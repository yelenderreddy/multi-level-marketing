import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class FileUploadService {
  private uploadPath = 'uploads/';

  getMulterConfig() {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, this.uploadPath);
        },
        filename: (req, file, cb) => {
          // Generate unique filename with original extension
          const uniqueName = `${uuidv4()}${extname(file.originalname || '')}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Accept only image files
        if (
          file.mimetype &&
          file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)
        ) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    };
  }

  getFileUrl(filename: string): string {
    return `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = join(this.uploadPath, filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
