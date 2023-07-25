import multer, { Multer } from "multer";
import { Request } from 'express';
// const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, 'temp'); // Substitua pelo caminho da pasta onde deseja armazenar os arquivos
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, file.originalname);
  },
});


const fileFilter = (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  // Verificar a extensão do arquivo
  const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (['.jpg', '.jpeg', '.png', '.pdf', '.xls', '.csv', '.xlsx', '.docs', '.docx'].includes(ext)) {
    // Aceitar o arquivo
    cb(null, true);
  } else {
    // Rejeitar o arquivo
    cb(new Error('Extensão de arquivo não permitida.'), false);
  }
};

const fileSizeLimit = 50 * 1024 * 1024;

const upload: Multer = multer({
  storage: storage,
  fileFilter: fileFilter as any
  , limits: { fieldSize: fileSizeLimit }
});

export { upload };