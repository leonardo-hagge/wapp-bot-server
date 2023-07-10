const con = require('./connector/mysql-connector.js');
const { Client, LocalAuth, MessageMedia, } = require('whatsapp-web.js');

const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const { error } = require('console');
// const mime = require('mime-types');
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let client: any = {};
let chats: any[] = new Array();




app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(fileUpload({
    debug: true
}));
app.use("/", express.static(__dirname + "/"))

app.get('/', (req: any, res: any) => {
    res.sendFile('index.html', {
        root: __dirname
    });
});



server.listen(port, function () {
    console.log('App running on *: ' + port);
});

console.log(con.getconnection())
console.log(con.selectAllConversations())





const startClient = () => {
    client = new Client({
        authStrategy: new LocalAuth({ clientId: 'bel-bot' }),
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
    });

    client.initialize();
};


startClient();


const logout = async () => await client.logout().then(() => startClient()).catch((error: any) => console.log(error));
let sendLog: any;

io.on('connection', function (socket: any) {
    client.on('qr', (qr: any) => {
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err: any, url: any) => {
            socket.emit('qr', url);
        });
    });

    client.on('ready', () => {
        socket.emit('ready', 'BOT Dispositivo pronto!');
        socket.emit('message', 'BOT Dispositivo pronto!');
        console.log('BOT Dispositivo pronto');
    });

    client.on('authenticated', () => {


        socket.emit('authenticated', 'BOT Autenticado!');
        socket.emit('message', 'BOT Autenticado!');
        console.log('BOT Autenticado');


    });

    client.on('auth_failure', function () {
        socket.emit('message', 'BOT Falha na autenticação, reiniciando...');
        console.error("BOT Falha na autenticação");
    });

    client.on('change_state', (state: any) => {
        console.log('BOT Status de conexão: ', state);
    });

    client.on('disconnected', (reason: any) => {
        socket.emit('logout', 'BOT Cliente desconectado!');
        console.log('BOT Cliente desconectado', reason);
        client.initialize();
    });



    sendLog = (msg: any) => socket.emit('message', msg);


    socket.on('logout', (reason: any) => {
        console.log('recebeu')
        logout();
    })

});






client.on('message', (message: any) => {



    // console.log(message.body);
    // console.log(message.from)
    // // message.reply('opa eae');
    // // client.sendMessage(message.from, 'eae');


    // const { message: replyMsg } = chatting(message.from, message.body)
    // console.log(replyMsg)
    // client.sendMessage(message.from, replyMsg);
});



app.post('/send-message', [
    body('number').notEmpty(),
    body('message').notEmpty(),
], async (req: any, res: any) => {
    console.log(req.body)
    const number = req.body.number;
    const numberDDI = number.substr(0, 2);
    const numberDDD = number.substr(2, 2);
    const numberUser = number.substr(-8, 8);
    const message = req.body.message;

    if (numberDDI != "55") {
        client.sendMessage(number + "@c.us", message).then((response: any) => {
            res.status(200).json({
                status: true,
                message: 'BOT Mensagem enviada',
                response: response
            });
            // socket.emit('message', 'BOT Mensagem enviada para o numero ' + number)
            sendLog('BOT Mensagem enviada para o numero ' + number);
        }).catch((err: any) => {
            res.status(500).json({
                status: false,
                message: 'BOT Mensagem não enviada',
                response: err.text
            });

            // socket.emit('message', 'BOT Mensagem não enviada para o numero ' + number)
            sendLog('BOT Mensagem não enviada para o numero ' + number);
        })
    } else {

        client.sendMessage("55" + numberDDD + numberUser + "@c.us", message).then((response: any) => {
            res.status(200).json({
                status: true,
                message: 'BOT Mensagem enviada',
                response: response
            });
            // socket.emit('message', 'BOT Mensagem enviada para o numero ' + number)
            sendLog('BOT Mensagem enviada para o numero ' + number);
        }).catch((err: any) => {
            res.status(500).json({
                status: false,
                message: 'BOT Mensagem não enviada',
                response: err.text
            });

            // socket.emit('message', 'BOT Mensagem não enviada para o numero ' + number)
            sendLog('BOT Mensagem não enviada para o numero ' + number);
        })
    }
});




function chatting(from: any, message: any) {
    let reply = {};
    if (!!chats && chats.some(c => c.from == from)) {
        reply = { 'message': 'Você não sabe nem eu', date: new Date() }
        chats.find(c => c.from == from).chats.push(reply)
    } else {
        reply = { 'message': 'Irineu', date: new Date() }
        chats.push({ from, chats: [reply] })
    }
    return reply;
}



















// const getChats = async () => (await client.getChats()
//     .then(res => {
//         // let chats = res;
//         // if (!chats)
//         //     chats.array.forEach(element => {
//         //         console.log(JSON.stringify(element) + "\n")
//         //     });
//     })).catch(error => console.log('Erro: ' + error)); 