import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") avatar: string;
  @type("boolean") isReady: boolean = false;
  @type("number") score: number = 0;
  
  constructor(id: string, name: string, avatar: string) {
    super();
    this.id = id;
    this.name = name;
    this.avatar = avatar;
  }
}

export class MatchState extends Schema {
  @type("string") status: string = "waiting"; // waiting, playing, finished
  @type({ map: Player }) players = new MapSchema<Player>();
}
