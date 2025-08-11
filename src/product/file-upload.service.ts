import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { join } from 'path';

// Type for multer file
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Injectable()
export class FileUploadService {
  private uploadPath = 'uploads/';

  getMulterConfig() {
    return {
      storage: diskStorage({
        destination: (
          req: any,
          file: MulterFile,
          cb: (error: Error | null, destination: string) => void,
        ) => {
          cb(null, this.uploadPath);
        },
        filename: (
          req: any,
          file: MulterFile,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          // Generate unique filename with original extension
          const uniqueName = `${uuidv4()}${extname(file.originalname || '')}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (
        req: any,
        file: MulterFile,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
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
