export default class Message {
  constructor(public chatId: number, public text: string) {}

  isCommand(command: string): boolean {
    return this.text.startsWith(command);
  }
}
