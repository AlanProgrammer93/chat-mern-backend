const { usuarioConectado, usuarioDesconectado, getUsuarios, grabarMensaje } = require("../controllers/sockets");
const { comprobarJWT } = require("../helpers/jwt");


class Sockets {

    constructor( io ) {

        this.io = io;

        this.socketEvents();
    }

    socketEvents() {
        // On connection
        this.io.on('connection', async ( socket ) => {

            const [ valido, uid ] = comprobarJWT( socket.handshake.query['x-token'] );

            if ( !valido ) {
                console.log('socket no identificado');
                return socket.disconnect();
            }

            await usuarioConectado(uid);

            // Unir al usuario a una sala de socket.io
            socket.join( uid );

          // validar el JWT
          // si no es valido desconectar

          // saber que usuario esta activo mediante el UID

          // emitir todos los usuarios conectados
          this.io.emit('lista-usuarios', await getUsuarios());

          // socket join

          // escuchar cuando el cliente manda un mensaje
          socket.on('mensaje-personal', async (payload) => {
              const mensaje = await grabarMensaje( payload );
              this.io.to(payload.para).emit('mensaje-personal', mensaje);
              // de esta forma se consume mas recurso en el servidor, lo mejor es agregar el nuevo mensaje en el frontend
              this.io.to(payload.de).emit('mensaje-personal', mensaje);
          });

          // manejar el desconectar
            socket.on('disconnect', async () => {
                await usuarioDesconectado(uid);
                this.io.emit('lista-usuarios', await getUsuarios());
            })
        
        });
    }

}


module.exports = Sockets;