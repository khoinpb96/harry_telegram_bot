import { telegramClient } from "@/externals";
import ScreenshotService from "@/services/screenshot.service";
import TelegramService from "@/services/telegram.service";

const screenshotService = new ScreenshotService();

export const telegramService = new TelegramService(
  telegramClient,
  screenshotService
);
