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

  public async deleteWebhook() {
    const { data } = await this.apiClient.post<TelegramRes>("/deleteWebhook", {
      drop_pending_updates: true,
    });

    if (!data.ok) {
      throw new Error(data.description);
    }

    console.log("TelegramClient - deleteWebhook successfully");
  }

  public async sendMessage(payload: { chatId: number; text: string }) {
    const { chatId, text } = payload;

    const body = {
      chat_id: chatId,
      text,
    };

    const { data } = await this.apiClient.post<
      TelegramRes<{
        message_id: number;
      }>
    >("/sendMessage", body);

    if (!data.ok) {
      throw new Error(data.description);
    }

    console.log("TelegramClient - sendMessage success");

    return data.result.message_id;
  }

  public async editMessage(payload: {
    chatId: number;
    text: string;
    messageId: number;
  }) {
    const { chatId, text, messageId } = payload;

    const body = {
      chat_id: chatId,
      message_id: messageId,
      text,
    };

    const { data } = await this.apiClient.post<
      TelegramRes<{
        message_id: number;
      }>
    >("/editMessageText", body);

    if (!data.ok) {
      throw new Error(data.description);
    }

    console.log("TelegramClient - editMessage success");

    return data.result.message_id;
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

  public async editMessageMedia(payload: {
    photoBuffer: Buffer;
    chatId: number;
    messageId: number;
    caption: string;
  }) {
    const { chatId, messageId, photoBuffer, caption } = payload;

    // Create form data for file upload
    const formData = new FormData();
    formData.append("chat_id", String(chatId));
    formData.append("message_id", String(messageId));

    // Prepare media object
    const mediaObject = {
      type: "photo",
      media: "attach://photo",
      caption: caption || "",
    };
    formData.append("media", JSON.stringify(mediaObject));

    // Append photo file
    const blob = new Blob([photoBuffer]);
    formData.append("photo", blob, "screenshot");
    formData.append("caption", caption);

    try {
      const res = await this.apiClient.post("/editMessageMedia", formData, {
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
