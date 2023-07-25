import { AppDataSource } from "../data-source";
import { MediaMessageIntegration } from "../entities/media-message-integration";

export const mediaMessageIntegrationRepository = AppDataSource.getRepository(MediaMessageIntegration);