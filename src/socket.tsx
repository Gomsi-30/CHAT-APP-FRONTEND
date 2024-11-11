// lib/socket.ts
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { io, Socket } from 'socket.io-client';


let socket: Socket<DefaultEventsMap, DefaultEventsMap> | undefined;

export const getSocket = (): Socket<DefaultEventsMap, DefaultEventsMap> => {
  if (!socket) {
    socket = io('http://localhost:3000', { withCredentials: true });
  }
  return socket;
};
