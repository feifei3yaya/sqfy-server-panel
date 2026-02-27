declare module 'squad-rcon' {
  export default class SquadRcon {
    constructor(config: any);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    execute(command: string): Promise<string>;
  }
}
