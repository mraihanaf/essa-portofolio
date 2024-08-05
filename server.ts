import makeWASocket, { DisconnectReason, BufferJSON, useMultiFileAuthState, isJidGroup } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import express, {Express, Request, Response } from "express"
import bcrypt from "bcrypt"
import path from "path"
import SocketIO from "socket.io"
import crypto from "crypto"
import http from "http"

let senders: string[] = []
let key = ''

const port = process.env.PORT || 8080
const socketPort = process.env.PORT || 3000 

const logger = pino({
    name: "wabot",
    level: "debug"
})

import Socket from "socket.io";


const app: Express = express()
const server = http.createServer(app)
const io = new SocketIO.Server(server)
const saltRounds = 10


  

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.set("views", path.join(__dirname,"../view"))
app.set("view engine", "ejs")

const publicDirectoryPath = path.join(__dirname, "../view/dist");
app.use(express.static(publicDirectoryPath));


app.get("/", (req: Request, res: Response) => {
    res.render("index")
})


// Function to hash a password with a salt


// Example default hashed password (for demonstration purposes; replace with your actual hashed password)


// Endpoint to check a password
app.post("/check", async (req: Request, res: Response) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = async(p: string) => await bcrypt.hash(p,salt)
    const defaultHash = await hashPassword("raihan123");
    logger.info(defaultHash)
    try {
        // Retrieve the password from the request body
        logger.info(req.body)
        const password = await hashPassword(req.body.password)
        logger.info(password)
        // Compare the provided password with the default hashed password
        if (password === defaultHash) {
            res.status(200).send(defaultHash);
            key = defaultHash
        } else {
            res.status(401).send("Wrong password");
        }
    } catch (error) {
        logger.error(error)
        res.status(500).send("Server error");
    }
});

class Info {
    type: string
    content: string
    id: string
    isGroup: boolean | undefined
    sender: string
    message: any
    isMention: boolean
    isQuoted: boolean
    isRep: boolean | { message: any }
    msg: string
    args: string[]
  
    constructor(type: string, msg: any) {
      this.type = type
      this.content = JSON.stringify(msg.message)
      this.id = msg.key.remoteJid
      this.isGroup = isJidGroup(this.id)
      this.sender = isJidGroup(this.id) ? msg.key.participant ?? this.id : this.id
      this.message = msg
      this.isMention = this.content.includes('mentionedJid')
      this.isQuoted = this.content.includes("quotedMessage")
      this.isRep = (this.type === 'extendedTextMessage' && this.isQuoted)
        ? { message: msg.message.extendedTextMessage?.contextInfo?.quotedMessage }
        : false
      this.msg = (() => {
            switch (this.type) {
                case 'conversation':
                return msg.message.conversation || ''
                case 'extendedTextMessage':
                return msg.message.extendedTextMessage?.text || ''
                case 'imageMessage':
                return msg.message.imageMessage?.caption || ''
                case 'videoMessage':
                return msg.message.videoMessage?.caption || ''
                case 'reactionMessage':
                return msg.message.reactionMessage?.text || ''
                case 'listResponseMessage':
                return msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || ''
                case 'buttonsResponseMessage':
                return msg.message.buttonsResponseMessage?.selectedButtonId || ''
                default:
                return ''
            }
      })()
      this.args = this.msg.split(/ /gi).slice(1)
    }
  }


async function connectToWhatsapp() {
    logger.info("connecting to whatsapp")
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        // @ts-ignore
        logger: logger
    })



    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            if(!lastDisconnect) return console.log("last disconnect undefined")
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            logger.error('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                logger.info("reconnecting to whatsapp")
                connectToWhatsapp()
            }
        } else if(connection === 'open') {
            logger.info('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async Messages => {
        const { messages } = Messages
        let msg = messages[0]
        if(!msg.message) return
        if(msg.key.fromMe) return
        const type = Object.keys(msg.message)[0]
        // @ts-ignore
        if(type === 'protocolMessage' && msg.message[type].type === 0) return
        const data = new Info(type,msg)
        logger.info(`[${data.isGroup ? "group" : "private"}](${data.sender}) ${data.msg}`)
        if(data.isGroup) return
        await sock.readMessages([msg.key])
        const msgLowerCase:string = await data.msg.toLowerCase()
        if(msgLowerCase.startsWith("ikut dong rai nama aku")){
            const name: string = await data.msg.replace("ikut dong rai nama aku","")
            if(name == "") return await sock.sendMessage(data.sender, { text: "namanya gak boleh kosong yaa, tolong ketik ulang :)"})
            if(senders.includes(data.sender)) return await sock.sendMessage(data.sender, { text: `nama kamu udah masuk yaa`})
	    logger.info(`${name} ikut giveaway`)
            io.emit("giveaway",name)
            senders.push(data.sender)
            await sock.sendMessage(data.sender, { text: "okee good luck ya! :)" })
	    await sock.sendMessage(data.sender, { text: "salam kenalll "+name})
        }
    })

    io.on('connection', (socket) => {
        logger.info('a user connected');
        socket.on("broadcast", async(user_key) => {
	    logger.info("broadcast")
	    if(user_key !== key) return logger.error("invalid key broadcast")
	    logger.info("success auth broadcast")
            for(const sender of senders){
                await sock.sendMessage(sender,{ text:"terimakasih sudah ikut yaa, salam kenall"})
	    }
	    senders = []
            logger.info("broadcast")
        })
    });
}

connectToWhatsapp().catch(err => {
    logger.fatal(err)
})

server.listen(port, function() {
    logger.info(`Listening on port ${port}`);
  });
