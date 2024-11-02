import { t } from "elysia";

export const telegramUser = t.Object({
  id: t.Number(),
  is_bot: t.Boolean(),
  first_name: t.String(),
  last_name: t.String(),
  username: t.String(),
  language_code: t.String(),
});

export const telegramChat = t.Object({
  id: t.Number(),
  type: t.Union([
    t.Literal("private"),
    t.Literal("group"),
    t.Literal("supergroup"),
    t.Literal("channel"),
  ]),
});

export const telegramWebhookBody = t.Object({
  update_id: t.Number(),
  message: t.Object({
    message_id: t.Number(),
    from: telegramUser,
    chat: telegramChat,
    text: t.String(),
  }),
});

export type TelegramRes<R = any> = {
  ok: boolean;
  result: R;
  description: string;
};

export type TelegramWebhookBodyDTO = typeof telegramWebhookBody.static;

export type TelegramChatDto = typeof telegramChat.static;
