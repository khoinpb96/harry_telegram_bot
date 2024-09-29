import type { TelegramRes } from "@/dtos";
import * as utils from "@/utils";
import axios from "axios";

export class TelegramClient {
  private apiClient = axios.create({
    baseURL: `https://api.telegram.org/bot${utils.Env.TELEGRAM_BOT_TOKEN}`,
  });

  public async setWebhook(webhookUrl: string) {
    const { data } = await this.apiClient.post<TelegramRes>("/setWebhook", {
      url: webhookUrl,
    });

    if (!data.ok) {
      throw new Error(data.description);
    }

    console.log("TelegramClient - setWebhook successfully");
  }

  public async setCommands() {
    const { data } = await this.apiClient.post<TelegramRes>("/setMyCommands", {
      commands: utils.Constants.telegramBotCommands,
    });

    if (!data.ok) {
      throw new Error(data.description);
    }

    console.log("TelegramClient - setCommands successfully");
  }

  public async sendMessage(payload: { chatId: number; text: string }) {
    const { chatId, text } = payload;

    const body = {
      chat_id: chatId,
      text,
    };

    const { data } = await this.apiClient.post<TelegramRes>(
      "/sendMessage",
      body
    );

    if (!data.ok) {
      throw new Error(data.description);
    }

    console.log("TelegramClient - sendMessage success");
  }

  public async sendPhoto(payload: {
    photoBuffer: Buffer;
    chatId: number;
    caption: string;
  }) {
    const { chatId, photoBuffer, caption } = payload;
    const formData = new FormData();
    const blob = new Blob([photoBuffer]);
    formData.append("chat_id", String(chatId));
    formData.append("photo", blob, "screenshot");
    formData.append("caption", caption);

    try {
      const res = await this.apiClient.post("/sendPhoto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data.ok) {
        throw new Error(res.data.description);
      }

      console.log("TelegramClient - sendPhoto success");
      return true;
    } catch (error) {
      console.error("TelegramClient - sendPhoto failed", error);
      throw error;
    }
  }
}

export const telegramClient = new TelegramClient();
