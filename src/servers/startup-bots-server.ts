import { deviceRepository } from '../repositories/DeviceRepository';
import { Client, Contact, LocalAuth, Message, MessageMedia } from 'whatsapp-web.js'
import { Device } from '../entities/device';
import { Message as msg } from '../entities/message'
import { chatRepository } from '../repositories/ChatRepository';
import path from 'path';
import QRCode from 'qrcode';
import api from '../api'
import { messageRepository } from '../repositories/MessageRepository';
import { FindOneOptions } from 'typeorm';
import { Chat } from '../entities/chat';
import { FormatDateToString } from '../helpers/date.helper'
import { messageIntegrationRepository } from '../repositories/MessageintegrationRepository';
import { MessageIntegration } from '../entities/message-integration';
import multer from 'multer';


var qrcodeTerminal = require('qrcode-terminal');



class StartupBotsServer {

  public async start() {

    const upload = multer({ dest: 'uploads/' });
    const repo = deviceRepository;
    const chatRepo = chatRepository;
    const msgRepo = messageRepository;
    const msgIntRepo = messageIntegrationRepository;

    // let chatExistent = await chatRepo.findOne({ where: { device: 2 } } as FindOneOptions<Chat>);

    // console.log(chatExistent)

    const setDeviceIsRuning = (device: Device) => {
      deviceRepository.save({ ...device, isAuthenticated: true, isRunning: true })
    }
    const setDeviceIsNotRuning = (device: Device) => {
      deviceRepository.save({ ...device, isAuthenticated: false, isRunning: false })
    }

    const getMessageIntegrationsPendingsByDevice = async (device: Device) => {
      return await msgIntRepo.find({ where: { device: { id: device.id }, pending: true }, select: ['device', 'medias'] })
    }


    const clearNumber = (phoneNumber: string) => {
      if (!!phoneNumber) {
        if (phoneNumber.includes('@c.us'))
          phoneNumber = phoneNumber.replace('@c.us', '');
        if (phoneNumber.includes('@g.us'))
          phoneNumber = phoneNumber.replace('@g.us', '');

        if (phoneNumber.includes("+"))
          phoneNumber = phoneNumber.replace('+', '');
        if (phoneNumber.includes("("))
          phoneNumber = phoneNumber.replace('+', '');
        if (phoneNumber.includes(")"))
          phoneNumber = phoneNumber.replace('+', '');

        while (phoneNumber.includes(" "))
          phoneNumber = phoneNumber?.replace(" ", "");
      }
      return phoneNumber;
    }


    const preparePhone = (phoneNumber: string) => {
      phoneNumber = clearNumber(phoneNumber);
      if (phoneNumber.length > 12)
        phoneNumber = phoneNumber?.substring(0, 4) + phoneNumber?.substring(5);
      return phoneNumber + "@c.us";
    }


    const getChatByNameAndDeviceAndIdentification = async (name: string, device: Device, from: string | undefined) => {
      try {
        return await chatRepo.findOne({ where: { device: { id: device.id }, name: name, indentification: from } });
      } catch (e) {
        console.log(e);
        return;
      }
    };

    const saveMessage = async (message: Message, device: Device) => {
      const { type, author, body: msg, from, to, fromMe, timestamp, } = message;
      let indentification = fromMe ? to : from;
      let rawData: any = message.rawData;
      const { body: bodyData, notifyName: alias } = rawData;
      let chatConversation = await message.getChat();
      let chat = await getChatByNameAndDeviceAndIdentification(chatConversation.name, device, indentification);
      try {
        if (!chat) {
          chat = await chatRepo.save({
            device: device,
            name: chatConversation.name,
            indentification: indentification,
            isPrivateChat: !chatConversation.isGroup,
            isGroup: chatConversation.isGroup,
          })
        }
        try {
          msgRepo.save({
            message: msg,
            alias_user: alias,
            device,
            type,
            received: !fromMe,
            from: clearNumber(from.includes('status') ? (!!author ? author : '') : (!!from ? from : '')),
            to: clearNumber(from.includes('status') ? '' : to.replace('@c.us', '')),
            sent: fromMe,
            chat: { ...new Chat(), ...chat },
            image: (type == 'image' ? bodyData : ''),
            dateEvent: new Date(timestamp * 1000) as Date
          })
        } catch (e) {
          console.log(`ERRO AO TENTAR SALVAR MESSAGEM DE ${clearNumber(from)} PARA ${chat?.isGroupChat ? chat.name : clearNumber(to)}, NO DISPOSITIVO ${device.alias}`)
        }
      } catch (e) {
        console.log(`ERRO AO TENTAR SALVAR CHAT DO DISPOSITIVO ${device.alias} E CHAT ${chatConversation.name}`)
      }

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
        client.on('ready', async () => {
          console.log(`Dispositivo (id:${device.id}-Numero:${device.number}-Alias:${device.alias}) rodando`)
          deviceRepository.save({ ...device, isAuthenticated: true, isRunning: true })

          // device.contacts = await client.getContacts();
          // setInterval(async () => {
          //   device.contacts = await client.getContacts();
          // }, 30000)


          setInterval(async () => {
            let msgs: MessageIntegration[] = await getMessageIntegrationsPendingsByDevice(device);
            // client.getChats().then(chats => console.log(chats)).catch(error => console.log(error))

            if (!!msgs)
              for (let m of msgs) {

                // let contact = await client.getChatById(clearNumber(m.indentification) + "@c.us");
                // if (!!contact)
                try {
                  if (!m.medias)
                    await client.sendMessage(preparePhone(m.identification), m.message);
                  else {
                    // const chat = await client.getChatById(clearNumber(m.identification) + "@c.us");
                    // if (!!chat)
                    m.medias.forEach(async (med, idx) => {
                      try {
                        const media = MessageMedia.fromFilePath(med.path)
                        if (idx == m.medias.length - 1)
                          await client.sendMessage(preparePhone(m.identification), media, { caption: m.message });
                        // await chat.sendMessage(media, { caption: m.message });
                        else
                          await client.sendMessage(preparePhone(m.identification), media);
                        // await chat.sendMessage(media);
                      } catch (e) {
                        console.log(e);
                      }
                    })
                  }
                  await msgIntRepo.save({ ...m, pending: false })
                } catch (error) {
                  console.log('Erro ao tentar mensagem para ' + m.identification)
                }
              }
          }, 30000)
          // client.getChats().then(res => console.log(res))
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

        client.on('message_create', async (message: Message) => {
          saveMessage(message, device);
        })

        client.on('message', async (message: Message) => {
          try {

            const { from, to, mentionedIds, timestamp } = message;
            if (from.includes('status'))
              return;
            saveMessage(message, device);





            //CONVERSATION WITH CHAT GPT
            if (!!mentionedIds && mentionedIds.some(m => clearNumber(m) == clearNumber(to))) {
              let msg = message.body;
              mentionedIds.forEach(m => msg = msg.replace(m, ""))
              api.post('quest', { quest: msg }, {
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




            let chatConversation = await message.getChat();
            let chat = { ...new Chat(), ...await getChatByNameAndDeviceAndIdentification(chatConversation.name, device, clearNumber(from)) };

            let messages: Message[] = await chatConversation.fetchMessages({ limit: 10, fromMe: true });
            // let messagesSaveds = await msgRepo.
            //   createQueryBuilder('message').
            //   where({ chat: { id: chat.id, device: { id: device.id } }, to: clearNumber(from), from: clearNumber(to), sent: true })
            //   .orderBy('message.dateEvent', 'DESC')
            //   .take(10)
            //   .getRawMany();



            let messagesSaveds: msg[] = await msgRepo.query(`SELECT m.*
            FROM message m 
            inner join chat c on c.id  = m."chatId" 
            inner join device d on d.id = c."deviceId" 
            where c.id = ${chat.id}  and d.id =${device.id} and m.to = '${clearNumber(from)}' and m.from ='${clearNumber(to)}' `)

            // let messagesSaveds = await msgRepo.
            //   find({
            //     where: {
            //       chat: {
            //         id: chat.id,
            //         device: { id: device.id }
            //       },
            //       to: clearNumber(from),
            //       from: clearNumber(to),
            //       sent: true,
            //       dateEvent: new Date(timestamp * 1000)
            //     }, order: {
            //       dateEvent: 'DESC'
            //     }
            //   });

            if (!!messages) {
              messages.every(async m => {
                if (!!messagesSaveds && messagesSaveds.some(c => c.message.toLowerCase() == m.body.toLowerCase()
                  && c.dateEvent.getTime() == new Date(m.timestamp * 1000).getTime()))
                  return false;
                else
                  await saveMessage(m, device);
                return true;
              })
            }

            if (message.body.toUpperCase().includes('GIVE ME FILE')) {

              // const media = await MessageMedia.fromFilePath('C:\\wapp-bot-server\\README.md');
              const media = await MessageMedia.fromUrl('https://gc.bel.ind.br/storage/produtos/thumbnail/placa-4x2-com-suporte-2-modulos-slim-ilumi-rf-82080-il00194-00-1673615324251.jpg');
              chatConversation.sendMessage(media, { caption: 'Pega o file ai meu parça' });



            }


          } catch (e) {
            console.log(e);
          }
        });
      })
    })
  }
}

export default new StartupBotsServer().start;