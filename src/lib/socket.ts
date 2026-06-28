class WebSocketWrapper {
  private ws: WebSocket | null = null;
  private listeners: Record<string, Set<Function>> = {};
  private reconnectDelay = 1000;
  private url = "";
  private autoReconnect = true;
  private sendBuffer: string[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      this.url = `${protocol}//${window.location.host}/api/ws`;
      this.connect();
    }
  }

  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.reconnectDelay = 1000;
        this.trigger("connect");

        while (this.sendBuffer.length > 0) {
          const msg = this.sendBuffer.shift();
          if (msg && this.ws) this.ws.send(msg);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type } = payload;
          if (type) {
            this.trigger(type, payload);
          }
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      this.ws.onclose = () => {
        console.log("❌ WebSocket disconnected");
        this.trigger("disconnect");
        if (this.autoReconnect) {
          setTimeout(() => this.connect(), this.reconnectDelay);
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        }
      };

      this.ws.onerror = (event) => {
        console.error("⚠️ WebSocket error");
        this.trigger("connect_error", event);
      };
    } catch (e) {
      console.error("Failed to create WebSocket:", e);
    }
  }

  disconnect() {
    this.autoReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      delete this.listeners[event];
    } else if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
  }

  emit(event: string, data: any) {
    const payload = JSON.stringify({ type: event, ...data });
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else {
      console.log(`⏳ Buffering: ${event}`);
      this.sendBuffer.push(payload);
    }
  }

  private trigger(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      for (const cb of this.listeners[event]) {
        try {
          cb(...args);
        } catch (e) {
          console.error(`Error in ${event} listener:`, e);
        }
      }
    }
  }
}

let socket: WebSocketWrapper | null = null;

export const getSocket = (): WebSocketWrapper | any => {
  if (typeof window === "undefined") {
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connect: () => {},
      disconnect: () => {},
    };
  }

  if (!socket) {
    socket = new WebSocketWrapper();
  }

  return socket;
};
