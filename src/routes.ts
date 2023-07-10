import { Router } from 'express';
import deviceController from './controllers/DeviceController'
import { Device } from './entities/device';

const routes = Router();


routes.get('/devices/findall', deviceController.find)
routes.get('/devices/:id', deviceController.findById)
routes.post('/devices/save', deviceController.save)




export default routes;