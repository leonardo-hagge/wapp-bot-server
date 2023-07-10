import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import routes from './routes';
import { DataSource } from 'typeorm';
// const port = process.env.PORT || 8000;
const port = 8000;
// const { Client, LocalAuth, MessageMedia, } = require('whatsapp-web.js');
import chatBotServer from './chat-bot-server';


AppDataSource.initialize().then(() => {

    const app = express();

    app.use(express.json());
    app.use(cors());
    app.use(routes);
    const http = require('http').Server(app);
    // app.listen(port);

    app.listen(8000, () => {
        console.log(`Server listening on ${8000}`);
    });
    console.log("Conexão com banco realizada com sucesso");
    chatBotServer();
})
    .catch((error) => console.log("Erro ao tentar iniciar conexão com o banco de dados, erro: " + error))




