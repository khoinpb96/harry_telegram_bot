export class Env {
  static PORT = Bun.env.PORT || 3000;
  static TELEGRAM_BOT_TOKEN = Bun.env.TELEGRAM_BOT_TOKEN;
  static NGROK_AUTHTOKEN = Bun.env.NGROK_AUTHTOKEN;
  static PRODUCTION_URL = Bun.env.PRODUCTION_URL;
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

export class Logger {
  constructor(private prefix?: string) {}

  debug(message: string) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[DEBUG] ${this.prefix ? `[${this.prefix}] -` : ""} ${message}`
      );
    }
  }

  info(message: string) {
    console.log(`[INFO] ${this.prefix ? `[${this.prefix}] -` : ""} ${message}`);
  }

  error(msg: string, error: unknown) {
    console.error(
      `[ERROR] ${this.prefix ? `[${this.prefix}] -` : ""} ${msg} ${
        error instanceof Error ? error.message : error
      }`
    );

    if (process.env.NODE_ENV !== "production" && error instanceof Error) {
      console.error(error.stack);
    }
  }
}
