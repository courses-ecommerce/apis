const app = require('./app');
const port = process.env.PORT || 3000
const passport = require('./src/middlewares/passport.middleware')
const SocketService = require('./src/services/chat.service')
const redis = require('redis');
const PORT_REDIS = process.env.PORT_REDIS
const redis_client = redis.createClient(PORT_REDIS)

global._redis = redis_client

async function ConnectRedis() {
    _redis.on('error', (err) => console.log('Redis Client Error', err));
    await _redis.connect()
}
ConnectRedis()



const server = app.listen(port, () => console.log('> Server is up and running on port : ' + port))

const io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
    }
});

global._io = io

global._io.use(passport.jwtAuthenticationSocket);

global._io.on('connection', SocketService.connection)

// io.on("connection", async (socket) => {
//     console.log("> a user connected socket");
//     // await _redis.SADD('123', 'id1')
//     // await _redis.SADD('123', 'id2')
//     // await _redis.SADD('123', 'id3')

//     // ngắt kết nối
//     socket.on("disconnect", async () => {
//         let value = await _redis.SMEMBERS('123')
//         console.log("a user disconnected socket", value);
//         await _redis.DEL(userId)
//         value = await _redis.SMEMBERS('123')

//         console.log("a user disconnected socket", value);
//         io.emit("information", { msg: "a user loggedout" })
//     })

//     // thêm user vào danh sách
//     socket.on("postUserData", async userId => {
//         console.log(userId, " loggedin with socket");
//         await _redis.SADD(userId, socket.id)
//         io.emit("information", { msg: "a user loggedin", users })
//     })

//     // gửi tin nhắn đến người nhận
//     socket.on("sendPrivateMessage", async ({ senderId, receiverId, text }) => {
//         const userReceiver = await getUserByUserId(receiverId)
//         io.to(userReceiver.socketId).emit("getPrivateMessage", {
//             senderId,
//             text
//         })
//     })

// })

