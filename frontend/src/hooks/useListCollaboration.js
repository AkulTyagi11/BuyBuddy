import { useEffect, useRef, useState } from 'react';

const getWsBaseUrl = () => {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname;
  const port = window.location.port === '5173' ? '8000' : window.location.port;
  const portSegment = port ? `:${port}` : '';
  return `${protocol}://${host}${portSegment}`;
};

export default function useListCollaboration({ listId, onEvent }) {
  const [status, setStatus] = useState('disconnected');
  const [activeUsers, setActiveUsers] = useState([]);
  const reconnectAttemptRef = useRef(0);
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    if (!listId) {
      return undefined;
    }

    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    const accessToken = tokens?.access;

    const connect = () => {
      if (!accessToken) {
        setStatus('disconnected');
        return;
      }

      const baseUrl = getWsBaseUrl();
      if (!baseUrl) {
        setStatus('disconnected');
        return;
      }

      setStatus('connecting');
      const socket = new WebSocket(`${baseUrl}/ws/lists/${listId}/?token=${accessToken}`);
      wsRef.current = socket;

      socket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setStatus('connected');
        socket.send(JSON.stringify({ type: 'ping' }));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'presence') {
            setActiveUsers(message.payload?.users || []);
            return;
          }

          if (onEvent) {
            onEvent(message.type, message.payload);
          }
        } catch {
          // ignore malformed payloads
        }
      };

      socket.onclose = () => {
        setStatus('disconnected');
        reconnectAttemptRef.current += 1;
        const delay = Math.min(4000, 1000 + reconnectAttemptRef.current * 750);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [listId, onEvent]);

  return { status, activeUsers };
}
