import * as dtos from "@/dtos";
import * as externals from "@/externals";
import * as utils from "@/utils";
import type {
  ScreenshotServiceABC,
  TelegramServiceABC,
} from "@/services/base.service";

export default class TelegramService implements TelegramServiceABC {
  constructor(
    private client: externals.TelegramClient,
    private screenshotService: ScreenshotServiceABC
  ) {}

  async handleMessage(dto: dtos.TelegramWebhookBodyDTO) {
    const { chat, text, from } = dto.message;
    if ("new_chat_member" in dto.message || "left_chat_member" in dto.message) {
      console.log(`TelegramService - someone invited or left, skipping`);
      return true;
    }

    console.log(
      `TelegramService - receive message from telegram, text: ${text}, from: ${from.username}, in: ${chat.type}-${chat.id}`
    );

    if (text.at(0) !== "/") {
      console.log(`TelegramService - not a command, skip`);
      return true;
    }

    switch (chat.type) {
      case "supergroup":
      case "channel":
        await this.client.sendMessage({
          chatId: chat.id,
          text: "Only support private and group chat.",
        });

        return false;
    }

    const [command, symbol, interval] = text.split(" ");

    if (command.includes(utils.TelegramBotCommands.GetChart)) {
      if (!symbol || !interval) {
        await this.client.sendMessage({
          chatId: chat.id,
          text: "Invalid format, must be /getchart <symbol> <interval>, .e.g /getchart xauusd 4h.",
        });

        return false;
      }

      const mappedInterval = this.mapInterval(interval);
      if (!mappedInterval) {
        await this.client.sendMessage({
          chatId: chat.id,
          text: "Invalid interval, we only support 1m, 3m, 5m, 15m, 30m, 45m, 1h, 2h, 3h, 4h, 1D, 1W, 1M, 3M, 6M, 1Y",
        });

        return false;
      }

      return this.getChart({
        symbol,
        interval: mappedInterval,
        chatId: chat.id,
      });
    }

    await this.client.sendMessage({
      chatId: chat.id,
      text: "We don't support this command.",
    });

    return false;
  }

  private async getChart(inputs: {
    chatId: number;
    symbol: string;
    interval: string;
  }): Promise<boolean> {
    const { chatId, symbol, interval } = inputs;
    const photoBuffer = await this.screenshotService.captureTradingViewChart(
      symbol,
      interval
    );
    return this.client.sendPhoto({
      chatId,
      photoBuffer,
      caption: `${symbol} - ${interval}`,
    });
  }

  private mapInterval(interval: string) {
    const mapping: Record<string, string> = {
      "1m": "1",
      "3m": "3",
      "5m": "5",
      "15m": "15",
      "30m": "30",
      "45m": "45",
      "1h": "60", // 1 hour = 60 minutes
      "2h": "120", // 2 hours = 120 minutes
      "3h": "180", // 3 hours = 180 minutes
      "4h": "240", // 4 hours = 240 minutes

      "1D": "1D", // 1 day
      "1W": "1W", // 1 week
      "1M": "1M", // 1 month
      "3M": "3M", // 3 months
      "6M": "6M", // 6 months
      "1Y": "12M", // 1 year = 12 months
    };

    return mapping[interval] || null; // Return null if the interval is not recognized
  }
}
