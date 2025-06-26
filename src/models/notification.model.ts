enum NotificationTopic {
    DOWNLOAD = 'download',
    SYNC = 'sync',
}

enum NotificationType {
    INFO = 'info',
    ERROR = 'error',
}

type NotificationMessage = {
    type: NotificationType;
    message: string;
};

export { NotificationTopic, NotificationType };
export type { NotificationMessage };
