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
// ConnectRedis()



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


