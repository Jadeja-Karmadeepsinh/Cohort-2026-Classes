import http from 'node:http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'node:path';

async function main() {
    const app = express();
    app.use(express.static(path.resolve("./public")));

    const server = http.createServer(app);
    const io = new Server();

    io.attach(server); //attch io to your http server

    io.on('connection', (socket) => {
        console.log(`A new socket has connected`, socket.id);

        //not we are listening for the user:message event fromt the client
        socket.on('user:message', (data) => {
            console.log(`Message from socket: `, data);

            //here when socket broadcasts the message it follows the same this as emit event name and data as parameters
            // socket.broadcast('event-name', 'data');
            socket.broadcast.emit('server:message', data);

            // Make absolutely sure everyone stops showing typing
            // socket.broadcast.emit('server:user:stop-typing', {
            //     id: socket.id
            // });

            socket.broadcast.emit('server:user:stop-typing', {
                id: socket.id,
                text: data.text
            });
        });

        //! socket.disconnect(); to disconncet socket server from backend

        socket.on('user:stop-typing', () => {
            socket.broadcast.emit('server:user:stop-typing', {
                id: socket.id
            });
        });

        socket.on('user:typing', (data) => {
            console.log(`User is typing`, socket.id, data);

            socket.broadcast.emit('server:user:typing', { id: socket.id });
        })
    })

    server.listen(9000, () => {
        console.log(`Http server is running on PORT 9000`);
    })
}

main();