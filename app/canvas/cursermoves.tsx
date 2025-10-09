'use client';

import { useCallback, useRef } from 'react';

interface UseCursorMovementProps {
  boardId: string;
  userId: string;
  userName: string;
  userColor: string;
}

export function useCursorMovement({
  boardId,
  userId,
  userName,
  userColor,
}: UseCursorMovementProps) {
  const ws = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Cursor WebSocket connected');
      };

      ws.current.onclose = () => {
        console.log('Cursor WebSocket disconnected, retrying...');
        setTimeout(connect, 1000); // auto-reconnect
      };
    }
  }, []);

  const sendCursor = useCallback(
    (x: number, y: number) => {
      if (!ws.current || ws.current.readyState !== WebSocket. OPEN) return;
      const payload = {
        type: 'cursor',
        boardId,
        userId,
        name: userName,
        color: userColor,
        x,
        y,
      };
      ws.current.send(JSON.stringify(payload));
    },
    [boardId, userId, userName, userColor]
  );

  // Call once to establish connection
  connect();

  return { sendCursor };
}
