import { deviceRepository } from '../repositories/DeviceRepository';
import { Client, LocalAuth, Message } from 'whatsapp-web.js'
import { Device } from '../entities/device';
import { chatRepository } from '../repositories/ChatRepository';
import path from 'path';
import QRCode from 'qrcode';
import api from '../api'

var qrcodeTerminal = require('qrcode-terminal');



class ManangerDevicesServer {

  public async start() {

    const repo = deviceRepository;
    const chatRepo = chatRepository;

    const setDeviceIsRuning = (device: Device) => {
      deviceRepository.save({ ...device, isAuthenticated: true, isRunning: true })
    }
    const setDeviceIsNotRuning = (device: Device) => {
      deviceRepository.save({ ...device, isAuthenticated: false, isRunning: false })
    }

    const clearNumber = (phoneNumber: string | undefined) => {
      if (!!phoneNumber) {
        if (phoneNumber.includes('@c.us'))
          phoneNumber = phoneNumber.replace('@c.us', '');
        if (phoneNumber.includes('@g.us'))
          phoneNumber = phoneNumber.replace('@g.us', '');
      }
      return phoneNumber;
    }

    const saveChat = (message: Message, device: Device) => {

      const { type, author, body: msg, from, to, fromMe, timestamp } = message;

      let rawData: any = message.rawData;
      const { body: bodyData, notifyName: alias } = rawData;

      chatRepo.save({
        message: msg,
        alias_user: alias,
        device,
        type,
        received: !fromMe,
        from: clearNumber(from.includes('status') ? author : from),
        to: clearNumber(from.includes('status') ? '' : to.replace('@c.us', '')),
        sent: fromMe,
        image: (type == 'image' ? bodyData : ''),
        dateEvent: new Date(timestamp * 1000)
      })
    }

    repo.find().then((devices: Device[]) => {

      devices.forEach(device => {

        setDeviceIsNotRuning(device);

        // let client: Client = !cons.some(c => c.deviceId == device.id) ? 
        const client = new Client({
          authStrategy: new LocalAuth({ clientId: 'bel-bot-device' + device.id, dataPath: `${path.resolve('sessions')}` },),
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
        })
        client.initialize().catch((e: Error) => console.log(e));
        // : cons.find(c => c.deviceId == deviceId)?.client;
        // if (!cons.some(c => c.deviceId == deviceId))
        //   cons.push({ deviceId, client })
        client.on('ready', async () => {
          console.log(`Dispositivo (id:${device.id}-Numero:${device.number}-Alias:${device.alias}) rodando`)
          // console.log(client.info)
          deviceRepository.save({ ...device, isAuthenticated: true, isRunning: true })

          // client.getChats().then(res => console.log(res))
          let res: any = await client.getChatById('554198403247@c.us');
          res.fetchMessages({ limit: 10 }).then((data: any) => console.log(data))
        });

        // client.on('authenticated', () => {
        //     socket.emit('authenticated', 'BOT Autenticado!');
        //     socket.emit('message', 'BOT Autenticado!');
        //     console.log('BOT Autenticado');
        // });

        client.on('auth_failure', function () {
          console.error("bot falha na autenticação");
        });

        client.on('change_state', (state: any) => {
          console.log('BOT Status de conexão: ', state);
        });

        client.on('disconnected', (reason: any) => {
          deviceRepository.save({ ...device, isAuthenticated: false })
          console.log(`Dispositivo (id:${device.id}-Numero:${device.number}-Alias:${device.alias}) não autenticado`)
        });

        client.on('qr', (qr: any) => {
          QRCode.toDataURL(qr, (err: any, url: any) => {
            device.qrcode_authentication = url;
            deviceRepository.save({ ...device, qrcode_authentication: url })
          });
          setDeviceIsNotRuning(device)
          console.log(`Dispositivo (id:${device.id}-Numero:${device.number}-Alias:${device.alias}) não autenticado`)

          qrcodeTerminal.generate(qr, { small: true }, (qrcode: any) => {
            for (let i = 0; i < 5; i++)
              console.log("-------------------------------------------------------");
            console.log(qrcode);
            for (let i = 0; i < 5; i++)
              console.log("-------------------------------------------------------");
          })

        });

        client.on('message', async (message: Message) => {
          try {

            const { from, to, mentionedIds, body } = message;
            if (from.includes('status'))
              return;
            saveChat(message, device);

            if (!!mentionedIds && mentionedIds.some(m => clearNumber(m) == clearNumber(to))) {
              let msg = message.body;
              mentionedIds.forEach(m => msg = msg.replace(m, ""))


              api.post('quest', { quest: message.body }, {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                }
              }).then((resp: any) => {
                const { answer } = resp.data;
                message.reply(answer);
              }).catch(error => {
                message.reply(error);
              })
            }
            // if (device.id == 3)
            //   client.sendMessage(message.from, 'Opa, Bão');

            // let test = getConnection().createQueryBuilder().addFrom(Chat, 'chat').addSelect
            let chats = await chatRepo.
              createQueryBuilder().
              where({ id: device.id, to: clearNumber(to), from: clearNumber(from), sent: true }).orderBy('dateEvent', 'DESC').take(10).getMany();

            let chat: any = await message.getChat();
            let messages: Message[] = await chat.fetchMessages({ limit: 10, fromMe: true });
            if (!!messages) {
              messages.every(async m => {
                if (!!chats && chats.some(c => c.message.toLowerCase() == m.body.toLowerCase()))
                  return false;
                else
                  await saveChat(m, device);
                return true;
              })
            }
          } catch (e) {
            console.log(e);
          }
        });
      })
    })
  }
}

export default new ManangerDevicesServer().start;