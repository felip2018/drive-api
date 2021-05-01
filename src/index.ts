import http from 'http';
import { debug } from 'node:console';
import app from './app';

let server: http.Server | undefined;
let port: string | number | undefined;

(() => {

    try {
        port = 3100;
        app.set('port', port);

        server = http.createServer(app);
        server.listen(port);

        server.on('error', onError);
        server.on('listening', onListening);

    } catch (error) {
        console.log('[ERROR] The application can not start', error);
    }

})();

function onError(error: any) {
    if(error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch(error.code) {
        case 'EACCESS':
            console.error(`${bind} requires elevated privileges!`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use!`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = (server as http.Server).address();
    const bind = typeof addr === 'string' ? `Pipe ${addr}` : `Port ${(addr as any).port}`;
    console.log(`Listening on ${bind}`);
}

export default server;