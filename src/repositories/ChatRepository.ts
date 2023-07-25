import { AppDataSource } from "../data-source";
import { Chat } from "../entities/chat";



export const chatRepository = AppDataSource.getRepository(Chat);




