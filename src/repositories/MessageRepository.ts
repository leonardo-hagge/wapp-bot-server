import { AppDataSource } from "../data-source";
import { Message } from "../entities/message";



export const messageRepository = AppDataSource.getRepository(Message);