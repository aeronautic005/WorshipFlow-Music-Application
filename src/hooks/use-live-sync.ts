"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  subscribeToLiveSync,
  type LiveSyncState,
} from "@/lib/realtime/live-sync"

interface UseLiveSyncOptions {
  setlistId: string
  enabled?: boolean
  isController?: boolean
  onRemoteSync?: (state: LiveSyncState) => void
}

export function useLiveSync({
  setlistId,
  enabled = true,
  isController = false,
  onRemoteSync,
}: UseLiveSyncOptions) {
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected")
  const [lastSyncState, setLastSyncState] = useState<LiveSyncState | null>(null)
  const broadcastRef = useRef<((state: Omit<LiveSyncState, "setlist_id" | "updated_at">) => Promise<void>) | null>(null)

  useEffect(() => {
    if (!enabled || !setlistId) return

    const { broadcast, unsubscribe } = subscribeToLiveSync(
      setlistId,
      (incoming) => {
        setLastSyncState(incoming)
        onRemoteSync?.(incoming)
      },
      (status) => {
        setConnectionStatus(status)
      }
    )

    broadcastRef.current = broadcast

    return () => {
      unsubscribe()
      broadcastRef.current = null
    }
  }, [setlistId, enabled, onRemoteSync])

  const sendPosition = useCallback(
    async (songIndex: number, sectionIndex: number, leaderName?: string) => {
      if (!broadcastRef.current) return
      await broadcastRef.current({
        song_index: songIndex,
        section_index: sectionIndex,
        leader_name: leaderName,
      })
    },
    []
  )

  return {
    connectionStatus,
    lastSyncState,
    sendPosition,
    isConnected: connectionStatus === "connected",
  }
}
