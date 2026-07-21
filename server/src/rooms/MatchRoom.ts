import { Room, Client } from "colyseus";
import { MatchState, Player } from "./schema/MatchState";
import { verifyToken } from "../utils/jwt";
import { supabase } from "../config/supabase";

export class MatchRoom extends Room<{ state: MatchState }> {
  maxClients = 2;
  finishedPlayers = new Set<string>();
  readyPlayers = new Set<string>();

  onCreate(options: any) {
    this.state = new MatchState();

    this.onMessage("ping", (client, message) => {
      console.log(`Received ping from ${client.sessionId}:`, message);
      client.send("pong", "Server acknowledges ping!");
    });

    this.onMessage("updateMetadata", (client, message) => {
      console.log(`Update metadata from ${client.sessionId}:`, message);
      if (message.vocabularyLevel) this.state.metadata.vocabularyLevel = message.vocabularyLevel;
      if (message.difficulty) this.state.metadata.difficulty = message.difficulty;
      if (message.topic) this.state.metadata.topic = message.topic;
    });

    this.onMessage("start_match", (client) => {
      console.log(`Received start_match from ${client.sessionId}`);
      if (this.state.players.size === 2) {
        this.state.status = "starting";
        this.broadcast("match_started");
      }
    });

    this.onMessage("update_score", (client, message: { score: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.score = message.score;
        console.log(`Updated player ${player.name} score to ${player.score}`);
      } else {
        console.warn(`[MatchRoom] player not found for sessionId: ${client.sessionId}`);
      }
    });

    this.onMessage("player_milestone", (client, message: { type: string, message: string, icon: string, color: string }) => {
      this.broadcast("opponent_milestone", message, { except: client });
    });

    this.onMessage("player_skip", (client) => {
      this.broadcast("opponent_skip", {}, { except: client });
    });

    this.onMessage("finished_round", (client) => {
      this.finishedPlayers.add(client.sessionId);
      console.log(`Player ${client.sessionId} finished round. (${this.finishedPlayers.size}/${this.state.players.size})`);
      if (this.finishedPlayers.size >= this.state.players.size) {
        this.finishedPlayers.clear();
        this.broadcast("start_recap_countdown");
      }
    });

    this.onMessage("ready_next_round", (client) => {
      this.readyPlayers.add(client.sessionId);
      console.log(`Player ${client.sessionId} ready for next round. (${this.readyPlayers.size}/${this.state.players.size})`);
      if (this.readyPlayers.size >= this.state.players.size) {
        this.readyPlayers.clear();
        this.state.status = "playing";
        this.broadcast("start_next_round");
      }
    });

    console.log(`MatchRoom created: ${this.roomId}`);
  }

  async onAuth(client: Client, options: any, request: any) {
    console.log("onAuth started", options);
    if (!options.token) {
      throw new Error("Authentication required");
    }

    try {
      const decoded = verifyToken(options.token);

      const { data: profile } = await supabase
        .from("players")
        .select("username, avatar_url, session_version")
        .eq("id", decoded.id)
        .single();

      if (!profile) {
        throw new Error("Account not found");
      }

      if (profile.session_version !== decoded.sessionVersion) {
        throw new Error("Session expired due to login elsewhere");
      }

      const name = profile.username || "Player";
      const avatar = profile.avatar_url?.trim()
        ? profile.avatar_url
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      return {
        id: decoded.id,
        name,
        avatar
      };
    } catch (e: any) {
      console.error("onAuth error!", e);
      throw new Error("Invalid token or failed to fetch profile: " + e.message);
    }
  }

  onJoin(client: Client, options: any) {
    console.log(`${client.sessionId} joined ${this.roomId}`);

    const id = options.id || client.auth?.id || client.userData?.id || client.sessionId;
    const name = options.name || client.auth?.name || client.userData?.name || "Anonymous";
    const avatar = options.avatar || client.auth?.avatar || client.userData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    if (this.state.players.size === 0) {
      this.state.hostId = id;
    }

    this.state.players.set(client.sessionId, new Player(id, name, avatar));
  }

  onLeave(client: Client, code?: number) {
    console.log(`${client.sessionId} left ${this.roomId}`);
    this.state.players.delete(client.sessionId);
    
    this.finishedPlayers.delete(client.sessionId);
    this.readyPlayers.delete(client.sessionId);
    
    if (this.state.status === "playing" || this.state.status === "starting") {
      this.broadcast("opponent_left");
    }
  }

  onDispose() {
    console.log(`MatchRoom disposed: ${this.roomId}`);
  }
}