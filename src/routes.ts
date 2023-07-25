import { Router } from 'express';
import deviceController from './controllers/DeviceController'
import MessageIntegrationController from './controllers/MessageIntegrationController';
import { upload } from './multer-config';

const routes = Router();


routes.get('/devices/findall', deviceController.find)
routes.get('/devices/:id', deviceController.findById)
routes.get('/devices/qrcode/:id', deviceController.findQrCodeByDeviceId)
routes.get('/devices/is-authenticated/:id', deviceController.findDeviceIsAuthenticated)
routes.post('/devices/save', deviceController.save)
routes.post('/chat/send-mesage', MessageIntegrationController.saveMessageIntegration)
routes.post('/chat/send-mesage-media', upload.any(), MessageIntegrationController.saveMessageIntegrationWithMedia)





export default routes;