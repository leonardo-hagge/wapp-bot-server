import { AppDataSource } from "../data-source";
import { MessageIntegration } from "../entities/message-integration";

export const messageIntegrationRepository = AppDataSource.getRepository(MessageIntegration);