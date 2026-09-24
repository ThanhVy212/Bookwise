const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Origin check only (no auth here — origin validation stays separate from
  // user authentication). Same-origin connections are allowed: the browser's
  // Origin must match this request's Host header. A missing Origin covers
  // same-origin polling GETs and non-browser clients. Covers both polling
  // handshakes and WebSocket (direct and upgrade) requests via allowRequest.
  const isAllowedOrigin = (req, origin) => {
    if (!origin) return true;
    let originUrl;
    try {
      originUrl = new URL(origin);
    } catch {
      return false;
    }
    return Boolean(req.headers.host) && originUrl.host === req.headers.host;
  };

  const io = new Server(httpServer, {
    allowRequest: (req, callback) => {
      callback(null, isAllowedOrigin(req, req.headers.origin));
    },
  });

  global.__socket_io = io;

  const parseCookieHeader = (header) => {
    const cookies = {};
    if (!header) return cookies;
    for (const part of header.split(";")) {
      const eqIndex = part.indexOf("=");
      if (eqIndex === -1) continue;
      try {
        cookies[part.slice(0, eqIndex).trim()] = decodeURIComponent(
          part.slice(eqIndex + 1).trim(),
        );
      } catch {
        // Ignore malformed cookie values
      }
    }
    return cookies;
  };

  // Verify the NextAuth JWT session from the handshake cookies and return the
  // authenticated user id. Never trust a client-supplied userId.
  // Note: Auth.js derives the JWE key with the session cookie name as HKDF salt,
  // so the matched cookie name must be passed as `salt` to decode.
  const getAuthenticatedUserId = async (socket) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie);
      const sessionCookieNames = [
        "authjs.session-token",
        "__Secure-authjs.session-token",
      ];
      let token = null;
      let salt = null;
      for (const name of sessionCookieNames) {
        if (cookies[name]) {
          token = cookies[name];
          salt = name;
          break;
        }
      }
      if (!token || !process.env.BETTER_AUTH_SECRET) return null;

      const { decode } = await import("next-auth/jwt");
      const decoded = await decode({
        token,
        secret: process.env.BETTER_AUTH_SECRET,
        salt,
      });
      const userId = decoded?.id || decoded?.sub;
      return typeof userId === "string" && userId ? userId : null;
    } catch {
      return null;
    }
  };

  io.on("connection", (socket) => {
    socket.on("join-user", async () => {
      const userId = await getAuthenticatedUserId(socket);
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on("leave-user", (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server active for real-time notifications`);
  });
});
