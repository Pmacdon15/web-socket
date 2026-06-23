import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (typeof window === "undefined") {
    // Return a mock object during server-side rendering (SSR)
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connect: () => {},
      disconnect: () => {},
    } as unknown as Socket;
  }

  if (!socket) {
    // We connect to the current origin (e.g. localhost:3000 or your Vercel deployment URL)
    socket = io(window.location.origin, {
      path: "/api/socket",
      transports: ["websocket"], // Required for Vercel functions compatibility
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("Socket.IO client connected with ID:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO client disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO client connection error:", error);
    });
  }

  return socket;
};
