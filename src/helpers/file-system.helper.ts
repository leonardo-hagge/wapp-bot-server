import fs from 'fs';
import path from 'path';



export const ROOT_PATH: string = path.join(__dirname, '../..');

export async function move(origem: string, destinoFolder: string, nameFile: string, mkdirs?: boolean) {

  const origemFullPath = path.join(ROOT_PATH, origem);
  const destinoFullPath = path.join(ROOT_PATH, destinoFolder);

  if (!fs.existsSync(origemFullPath))
    new Error('Erro: Arquivo inexistente')



  if (await !fs.existsSync(destinoFullPath))
    if (!!mkdirs)
      await fs.mkdirSync(destinoFullPath, { recursive: true })
    else
      new Error('Erro: Caminho final inexistente e a criação da  pasta esta desabilitada')

  await fs.rename(origemFullPath, destinoFullPath + "\\" + nameFile, (err) => {
    if (err)
      new Error('Erro ao mover o arquivo:' + err);
  });


}