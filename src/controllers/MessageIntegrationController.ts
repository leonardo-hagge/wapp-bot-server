import { Request, Response } from 'express';
import { MessageIntegration } from "../entities/message-integration";
import { messageIntegrationRepository } from "../repositories/MessageintegrationRepository";
import { mediaMessageIntegrationRepository } from '../repositories/MediaMessageIntegrationRepository';
import { MediaMessageIntegration } from '../entities/media-message-integration';
import { move, ROOT_PATH } from '../helpers/file-system.helper'


export class MessageIntegrationController {

  public async saveMessageIntegration(req: Request, res: Response): Promise<any> {
    const repo = messageIntegrationRepository;
    repo.save({ ...new MessageIntegration(), ...req.body }).then(msg => {
      return res.json({ ...new MessageIntegration(), ...msg })
    }).catch(error => {
      return res.json(error)
    })
  }
  public async saveMessageIntegrationWithMedia(req: Request, res: Response): Promise<any> {
    const repo = messageIntegrationRepository;
    const mediaRepo = mediaMessageIntegrationRepository;

    const { deviceId, message, identification } = req.body;


    const msgIntegration: MessageIntegration = await repo.save({
      identification, message, device: { id: deviceId }
    })

    let finalPath = `uploads\\message-integration-${msgIntegration.id}`;
    if (!!req.files) {
      for (let r of req.files as any) {
        const { filename, size, path } = r;
        const media: MediaMessageIntegration = await mediaRepo.save({
          message: msgIntegration,
          name: filename,
          path,
          size,
        })
        try {
          await move(media.path, finalPath, media.name, true);
          await mediaRepo.save({ ...media, path: (ROOT_PATH + "\\" + finalPath + "\\" + filename) })
        } catch (e) {
          console.log(e)
        }
      }
    }

    return res.json({ ...new MessageIntegration(), ... await repo.find({ where: { id: msgIntegration.id } }) });
  }
}



export default new MessageIntegrationController()