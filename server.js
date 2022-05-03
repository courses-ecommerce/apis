const app = require('./app');
const port = process.env.PORT || 3000

const redis = require('redis');
const PORT_REDIS = process.env.PORT_REDIS
const redis_client = redis.createClient(PORT_REDIS)


async function ConnectRedis() {
    redis_client.on('error', (err) => console.log('Redis Client Error', err));
    await redis_client.connect()
}

// ConnectRedis()



const server = app.listen(port, () => console.log('> Server is up and running on port : ' + port))

const io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
    }
});

// danh sách người dùng hiện đang online
let users = []

// thêm 1 user vào danh sách
const addUser = async (userId, socketId) => {
    // await redis_client.set(userId, socketId, { EX: 18000 /* 5h */ }) // nếu tồn tại thì sẽ ghi đè socketId mới
    let index = users.findIndex(user => user.userId === userId)
    if (index != -1) {
        users[index].socketId = socketId
    } else {
        users.push({ userId, socketId })
    }
}

// xoá 1 user khỏi danh sách
const removeUserBySocketId = async (socketId) => {
    // await redis_client.del(userId)
    users = users.filter(item => item.socketId !== socketId)
}

// lấy thông tin user
const getUserByUserId = async (userId) => {
    // return await redis_client.get(userId)
    return await users.find(user => user.userId === userId)
}

// const getUserBySocketId = async (socketId) => {
//     // get all key => check socketId
//     let keys = await redis_client.keys("*")
//     for (let i = 0; i < keys.length; i++) {
//         let data = await redis_client.get(keys[i])
//         if (data.socketId === socketId) {
//             return data
//         }
//     }
// }


io.on("connection", socket => {
    console.log("> a user connected socket");

    // ngắt kết nối
    socket.on("disconnect", () => {
        console.log("a user disconnected socket");
        removeUserBySocketId(socket.id)
        io.emit("information", { msg: "a user loggedout", users })
    })

    // thêm user vào danh sách
    socket.on("postUserData", async userId => {
        console.log(userId, " loggedin with socket");
        addUser(userId, socket.id)
        io.emit("information", { msg: "a user loggedin", users })
    })

    // gửi tin nhắn đến người nhận
    socket.on("sendPrivateMessage", async ({ senderId, receiverId, text }) => {
        const userReceiver = await getUserByUserId(receiverId)
        io.to(userReceiver.socketId).emit("getPrivateMessage", {
            senderId,
            text
        })
    })

})

