import { AppDataSource } from "../data-source";
import { Device } from "../entities/device";

export const deviceRepository = AppDataSource.getRepository(Device);