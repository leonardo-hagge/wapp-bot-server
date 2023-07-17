import { Device } from '../entities/device';
import { Request, Response } from 'express';
import { deviceRepository } from '../repositories/DeviceRepository';

export class DeviceController {

    public async find(req: Request, res: Response): Promise<any> {
        const repo = deviceRepository
        repo.find({ order: { id: 'DESC' } }).then(dev => {
            return res.json(dev)
        }).catch(error => {
            return res.json(error)
        })
    }



    public async save(req: Request, res: Response): Promise<any> {

        console.log(req.body)
        const repo = deviceRepository
        const device = req.body;

        repo.save(device).then(dev => {
            return res.json(dev)
        }).catch(error => {
            return res.json(error)
        })
    }



    public async findById(req: Request, res: Response) {
        const deviceId: number = +req.params.id;
        const repo = deviceRepository

        repo.findOne({ where: { id: deviceId } }).then(dev => {
            return res.json(dev)
        }).catch(error => {
            return res.json(error)
        })
    }
    public async findQrCodeByDeviceId(req: Request, res: Response) {
        const deviceId: number = +req.params.id;
        const repo = deviceRepository

        repo.findOne({ select: ['qrcode_authentication'], where: { id: deviceId } }).then(dev => {
            return res.json(dev)
        }).catch(error => {
            return res.json(error)
        })
    }
    public async findDeviceIsAuthenticated(req: Request, res: Response) {
        const deviceId: number = +req.params.id;
        const repo = deviceRepository

        repo.findOne({ select: ['isAuthenticated', 'qrcode_authentication'], where: { id: deviceId } }).then(dev => {
            return res.json(dev)
        }).catch(error => {
            return res.json(error)
        })
    }
}


export default new DeviceController();