import { telegramClient } from "@/externals";
import ScreeshotService from "@/services/screenshot.service";
import TelegramService from "@/services/telegram.service";

const screenshotService = new ScreeshotService();

export const telegramService = new TelegramService(
  telegramClient,
  screenshotService
);
