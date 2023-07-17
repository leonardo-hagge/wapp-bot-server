import { createServer } from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { deviceRepository } from '../repositories/DeviceRepository';
import QRCode from 'qrcode';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import path from 'path';



type DevicesConnection = {
    deviceId: number;
    client: any;
}



class ManangerDevicesServer {
    public start() {
        const repo = deviceRepository;

        // repo.find().then((res) => console.log(res))
        const app = express();
        const httpServer = createServer(app);

        const io = new Server(httpServer, {
            cors: {
                origin: 'http://localhost:3000',
                credentials: true
            }
        });


        io.on('connection', (socket: any) => {
            let cons: DevicesConnection[] = [];

            socket.emit('message', 'Conexão com servidor iniciada');

            socket.on('deviceId', (deviceId: any) => {
                console.log(deviceId)

                let client: Client = !cons.some(c => c.deviceId == deviceId) ? new Client({
                    authStrategy: new LocalAuth({ clientId: 'bel-bot-device' + deviceId, dataPath: `${path.resolve('sessions')}` }),
                    puppeteer: {
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-accelerated-2d-canvas',
                            '--no-first-run',
                            '--no-zygote',
                            '--single-process', // <- this one doesn't works in Windows
                            '--disable-gpu'
                        ]
                    }
                }) : cons.find(c => c.deviceId == deviceId)?.client;


                if (!cons.some(c => c.deviceId == deviceId))
                    cons.push({ deviceId, client })



                client.initialize().catch(e => console.log(e));

                client.on('qr', (qr: any) => {
                    console.log('qr received' + deviceId, qr);

                    //socket.emit('qrcode', qr);

                    QRCode.toDataURL(qr, (err: any, url: any) => {
                        socket.emit('qrcode', {
                            deviceId: deviceId,
                            qrCode: url
                        });
                    });
                });

                client.on('ready', () => {
                    socket.emit('deviceConnected', 'BOT Dispositivo pronto!');
                    socket.emit('message', 'BOT Dispositivo pronto!');
                    console.log('BOT Dispositivo pronto');
                });




                // client.on('authenticated', () => {


                //     socket.emit('authenticated', 'BOT Autenticado!');
                //     socket.emit('message', 'BOT Autenticado!');
                //     console.log('BOT Autenticado');


                // });

                // client.on('auth_failure', function () {
                //     socket.emit('message', 'BOT Falha na autenticação, reiniciando...');
                //     console.error("BOT Falha na autenticação");
                // });

                // client.on('change_state', (state: any) => {
                //     console.log('BOT Status de conexão: ', state);
                // });

                // client.on('disconnected', (reason: any) => {
                //     socket.emit('logout', 'BOT Cliente desconectado!');
                //     console.log('BOT Cliente desconectado', reason);
                //     client.initialize();
                // });


                // client.on('message', (message: any) => {
                //     console.log(message)
                // });

                socket.on('stopClient', (msg: string) => {
                    client.destroy().catch(e => { client.destroy().catch(e => console.log("cliente WW Finalizado")) })
                }
                )

                socket.on('disconnect', () => {
                    console.log('Cliente desconectado');
                    client.destroy().catch(e => { client.destroy().catch(e => console.log("cliente WW Finalizado")) })
                    socket.removeAllListeners();
                });
            });











            // Lógica para lidar com eventos de cliente
            // socket.on('mensagem', (data: any) => {
            //     console.log('Mensagem recebida:', data);
            //     // Lógica para processar a mensagem e enviar uma resposta
            //     socket.emit('resposta', 'Resposta do servidor');
            // });


        });






        httpServer.listen(4000, () => {
            console.log('Servidor socket ouvindo na porta 4000');
        });

    }


    // createManterConnector() {

    // }

}









export default new ManangerDevicesServer().start;