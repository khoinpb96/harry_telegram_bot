import { Elysia } from "elysia";
import { telegramController } from "@/controllers";

const app = new Elysia();

app.get("/health", "OK");

app.post("/webhook/telegram", async ({ body }) => {
  return await telegramController(body);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
