import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface LiveSyncState {
  setlist_id: string
  song_index: number
  section_index: number
  leader_id?: string
  leader_name?: string
  updated_at: number
}

export type LiveSyncCallback = (state: LiveSyncState) => void
export type ConnectionStatusCallback = (status: "connecting" | "connected" | "disconnected") => void

/**
 * Creates and connects to a Supabase Realtime broadcast channel for a live service.
 * Allows instant synchronization of current song and section across band members without polling.
 */
export function subscribeToLiveSync(
  setlistId: string,
  onSync: LiveSyncCallback,
  onStatusChange?: ConnectionStatusCallback
): {
  channel: RealtimeChannel | null
  broadcast: (state: Omit<LiveSyncState, "setlist_id" | "updated_at">) => Promise<void>
  unsubscribe: () => void
} {
  try {
    const supabase = createClient()
    const channelName = `live-service-${setlistId}`

    onStatusChange?.("connecting")

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: false, // Don't echo events back to the sender
        },
      },
    })

    channel
      .on("broadcast", { event: "section_change" }, ({ payload }) => {
        if (payload && payload.setlist_id === setlistId) {
          onSync(payload as LiveSyncState)
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          onStatusChange?.("connected")
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          onStatusChange?.("disconnected")
        }
      })

    const broadcast = async (state: Omit<LiveSyncState, "setlist_id" | "updated_at">) => {
      const payload: LiveSyncState = {
        ...state,
        setlist_id: setlistId,
        updated_at: Date.now(),
      }
      try {
        await channel.send({
          type: "broadcast",
          event: "section_change",
          payload,
        })
      } catch (err) {
        console.warn("Failed to broadcast live sync state:", err)
      }
    }

    const unsubscribe = () => {
      try {
        channel.unsubscribe()
        onStatusChange?.("disconnected")
      } catch {}
    }

    return { channel, broadcast, unsubscribe }
  } catch (err) {
    console.warn("Realtime channel initialization fallback:", err)
    onStatusChange?.("disconnected")
    return {
      channel: null,
      broadcast: async () => {},
      unsubscribe: () => {},
    }
  }
}
