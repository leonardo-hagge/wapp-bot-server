declare module 'multer' {
  import { Request } from 'express';

  interface File extends Express.Multer.File { }

  interface Multer {
    single(fieldname: string): (req: Request, res: any, next: any) => void;
  }

  function multer(options?: any): Multer;
  export = multer;
}