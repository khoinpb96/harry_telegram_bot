import * as externals from "@/externals";
import * as services from "@/services";
import { Env, ServiceError } from "@/utils";
import { swagger } from "@elysiajs/swagger";
import ngrok from "@ngrok/ngrok";
import { Elysia } from "elysia";

function initElysia(telegramService = services.telegramService) {
  new Elysia()
    .use(swagger())
    .error("SERVICE_ERROR", ServiceError)
    .onError(({ error, code }) => {
      switch (code) {
        case "SERVICE_ERROR":
          return error.message;
      }
    })
    .onTransform(function log({ path, request: { method } }) {
      console.log(`${method} ${path}`);
    })
    .get("/health", {
      ok: true,
      result: "Server is on",
    })
    .post("/webhook/telegram", async ({ body }) => ({
      ok: await telegramService.handleMessage(body as any),
    }))
    .listen(Env.PORT, () => console.log(`Server running on port:${Env.PORT}`));
}

async function initNgrok() {
  const listener = await ngrok.connect({
    addr: Env.PORT,
    authtoken: Env.NGROK_AUTHTOKEN,
  });

  const url = listener.url();
  if (!url) {
    throw new Error("ngrok url is null");
  }

  console.log(`Ngrok established on ${url}`);
  return url;
}

async function main(deps: { telegramClient: externals.TelegramClient }) {
  const { telegramClient } = deps;
  initElysia();
  const ngrokUrl = await initNgrok();
  const webhookUrl = `${ngrokUrl}/webhook/telegram`;
  await Promise.all([
    telegramClient.setWebhook(webhookUrl),
    telegramClient.setCommands(),
  ]);
}

await main({
  telegramClient: externals.telegramClient,
});
