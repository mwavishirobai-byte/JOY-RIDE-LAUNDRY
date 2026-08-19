import { useEffect, useRef, useState, useCallback } from 'react';

export type RealtimeEventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_UPDATED'
  | 'SERVICE_UPDATED'
  | 'BOOKING_CREATED'
  | 'BOOKING_UPDATED'
  | 'DELIVERY_UPDATED'
  | 'NOTIFICATION_CREATED'
  | 'SETTINGS_UPDATED';

type EventHandler = (data: any) => void;

export function useRealtime() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<{ event: string; data: any; timestamp: number } | null>(null);
  const listenersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let active = true;
    let retryTimer: any = null;

    function connect() {
      if (!active) return;

      try {
        const es = new EventSource('/api/realtime/stream');
        eventSourceRef.current = es;

        es.onopen = () => {
          if (active) setIsConnected(true);
        };

        es.onerror = () => {
          if (active) {
            setIsConnected(false);
            es.close();
            retryTimer = setTimeout(connect, 3000);
          }
        };

        const eventTypes: RealtimeEventType[] = [
          'ORDER_CREATED',
          'ORDER_STATUS_CHANGED',
          'ORDER_UPDATED',
          'SERVICE_UPDATED',
          'BOOKING_CREATED',
          'BOOKING_UPDATED',
          'DELIVERY_UPDATED',
          'NOTIFICATION_CREATED',
          'SETTINGS_UPDATED',
        ];

        eventTypes.forEach((evt) => {
          es.addEventListener(evt, (e: MessageEvent) => {
            if (!active) return;
            try {
              const data = JSON.parse(e.data);
              setLastEvent({ event: evt, data, timestamp: Date.now() });

              const handlers = listenersRef.current.get(evt);
              if (handlers) {
                handlers.forEach((fn) => fn(data));
              }

              // Also trigger wildcard handlers
              const allHandlers = listenersRef.current.get('*');
              if (allHandlers) {
                allHandlers.forEach((fn) => fn({ event: evt, data }));
              }
            } catch (err) {
              console.error('Error handling SSE payload:', err);
            }
          });
        });
      } catch (err) {
        if (active) {
          setIsConnected(false);
          retryTimer = setTimeout(connect, 4000);
        }
      }
    }

    connect();

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const subscribe = useCallback((event: RealtimeEventType | '*', handler: EventHandler) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(handler);

    return () => {
      const handlers = listenersRef.current.get(event);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }, []);

  return { isConnected, lastEvent, subscribe };
}
