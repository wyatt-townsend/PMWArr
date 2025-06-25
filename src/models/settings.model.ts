type Settings = {
    auto_download: boolean;
    sync_day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    sync_hour: number; // 0-23 for hours
};

export default Settings;
