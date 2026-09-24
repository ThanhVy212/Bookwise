declare global {
  // eslint-disable-next-line no-var
  var __socket_io: any;
}

export const emitSocketNotification = (userId: string, notification: any) => {
  try {
    if (typeof global !== "undefined" && global.__socket_io) {
      global.__socket_io.to(`user_${userId}`).emit("notification:new", notification);
    }
  } catch (error) {
    console.error("Error emitting socket notification:", error);
  }
};

export const broadcastSocketNotification = (notification: any) => {
  try {
    if (typeof global !== "undefined" && global.__socket_io) {
      global.__socket_io.emit("notification:broadcast", notification);
    }
  } catch (error) {
    console.error("Error broadcasting socket notification:", error);
  }
};
