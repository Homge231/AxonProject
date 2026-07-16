import dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

/**
 * Sends a Realtime Broadcast message via Supabase's REST API instead of
 * opening a websocket channel + subscribing on the server side.
 *
 * Why: `supabase.channel(...).send(...)` on an unsubscribed channel silently
 * auto-subscribes first (websocket handshake), which introduces a delay.
 * If the HTTP login response reaches the client and the client subscribes
 * to the same channel before that delayed broadcast actually fires, the
 * client that JUST logged in ends up receiving (and reacting to) its own
 * kick message — instantly logging itself out.
 *
 * The REST broadcast endpoint sends synchronously over plain HTTP with no
 * websocket handshake, so by the time this function resolves, the message
 * has already been delivered to any currently-subscribed clients. Since we
 * always call this BEFORE responding to the login request, the newly
 * logged-in client can never be subscribed in time to receive its own event.
 */
export async function broadcastSessionInvalidated(userId: string, newVersion: number) {
  try {
    const res = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `session-kick:${userId}`,
            event: 'session_invalidated',
            payload: { session_version: newVersion }
          }
        ]
      })
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('broadcastSessionInvalidated failed:', res.status, text)
    }
  } catch (err) {
    console.error('broadcastSessionInvalidated failed:', err)
  }
}