class SocketService {

    // connection
    connection(socket) {
        socket.on("disconnect", () => {
            console.log("a user disconnected socket ", socket.id);
        })
    }
}


module.exports = new SocketService()