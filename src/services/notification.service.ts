import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger.util.js';
import { NotificationTopic, NotificationMessage } from '../models/notification.model.js';

class NotificationService {
    private io: SocketIOServer;

    registerSocket(io: SocketIOServer) {
        this.io = io;

        // Configure logging
        this.io.on('connection', (socket) => {
            logger.info('A client connected via WebSocket');
            socket.on('disconnect', () => {
                logger.info('A client disconnected');
            });
            // You can add more event handlers here
        });
    }

    notify(topic: NotificationTopic, message: NotificationMessage) {
        if (!this.io) {
            console.warn('Socket.IO not initialized. Notifications will not be sent.');
            return;
        }

        logger.debug(`Emitting notification on topic: ${topic} with message: ${JSON.stringify(message)}`);
        this.io.emit(topic, message);
    }
}

export default new NotificationService();
