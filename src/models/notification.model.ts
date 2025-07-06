enum NotificationTopic {
    DOWNLOAD = 'download',
    SYNC = 'sync',
    SETTINGS = 'settings',
}

enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
}

type NotificationMessage = {
    type: NotificationType;
    message: string;
};

export { NotificationTopic, NotificationType };
export type { NotificationMessage };
