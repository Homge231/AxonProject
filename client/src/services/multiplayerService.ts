import { Client, Room } from "colyseus.js";
import { MatchState } from "../game/schema/MatchState";

// Ensure the Colyseus connection points to the correct backend host
const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const endpoint = serverUrl.replace(/^http/, "ws");

export const colyseusClient = new Client(endpoint);
export let currentRoom: Room<MatchState> | null = null;

export async function createMatchRoom(options: any = {}) {
  try {
    currentRoom = await colyseusClient.create<MatchState>("match_room", options);
    console.log("Created room successfully!", currentRoom.roomId);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("Create room error:", e);
    throw e;
  }
}

export async function joinMatchRoomById(roomId: string, options: any = {}) {
  try {
    currentRoom = await colyseusClient.joinById<MatchState>(roomId, options);
    console.log("Joined room successfully!", currentRoom.roomId);
    setupRoomListeners(currentRoom);
    return currentRoom;
  } catch (e) {
    console.error("Join room error:", e);
    throw e;
  }
}

function setupRoomListeners(room: Room) {
  room.onStateChange((state) => {
    console.log("Room state changed:", state);
  });

  room.onMessage("pong", (message) => {
    console.log("Received pong from server:", message);
  });
}

export function leaveMatchRoom() {
  if (currentRoom) {
    currentRoom.leave();
    currentRoom = null;
  }
}
