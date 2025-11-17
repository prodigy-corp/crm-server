import { Request } from 'express';

export interface AuthenticateRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    status: string;
  };
}

import { Multer } from 'express'; // Import Multer from the @types/express package

@ApiConsumes('multipart/form-data')
export class UploadFileDto {
  file: Multer.File; // Use the imported Multer type
}
