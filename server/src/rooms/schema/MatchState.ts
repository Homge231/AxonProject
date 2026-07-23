import { Schema, type, MapSchema } from "@colyseus/schema";

export class RoomMetadata extends Schema {
  @type("string") vocabularyLevel: string = "Normal";
  @type("string") difficulty: string = "Standard";
  @type("string") topic: string = "Any";
}

export class Player extends Schema {
  @type("string") id: string;
  @type("string") name: string;
  @type("string") avatar: string;
  @type("boolean") isReady: boolean = false;
  @type("number") score: number = 0;
  @type("string") activeCoreId: string = "";
  
  constructor(id: string, name: string, avatar: string) {
    super();
    this.id = id;
    this.name = name;
    this.avatar = avatar;
  }
}

export class MatchState extends Schema {
  @type("string") status: string = "waiting"; // waiting, playing, finished
  @type("string") hostId: string = ""; // Identifies the room host
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(RoomMetadata) metadata = new RoomMetadata();
}
