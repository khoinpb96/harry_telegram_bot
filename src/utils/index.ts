export class Env {
  static PORT = Bun.env.PORT || 3000;
  static TELEGRAM_BOT_TOKEN = Bun.env.TELEGRAM_BOT_TOKEN;
  static NGROK_AUTHTOKEN = Bun.env.NGROK_AUTHTOKEN;
}

export class ServiceError extends Error {
  code = "SERVICE_ERROR";
  constructor(public message: any, public status: number) {
    super(message);
  }
}

export enum TelegramBotCommands {
  GetChart = "/gc",
}

export class Constants {
  static telegramBotCommands = [
    {
      command: TelegramBotCommands.GetChart,
      description: "Get Tradingview chart screenshot",
    },
  ];

  static botName = "harry_trade_assistant_bot";
}
