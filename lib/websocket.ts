import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyJWT } from './jwt';
import { prisma } from './prisma';

export interface SocketUser {
  id: string;
  email: string;
  organizationId: string;
  role: string;
}

let io: SocketIOServer;

export function initializeWebSocket(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = verifyJWT(token);
      if (!payload) {
        return next(new Error('Invalid authentication token'));
      }

      // Verify user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          organizationId: true,
          role: true,
          status: true
        }
      });

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('User not found or inactive'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user: SocketUser = socket.data.user;
    console.log(`User ${user.email} connected to WebSocket`);

    // Join organization room for organization-wide broadcasts
    socket.join(`org:${user.organizationId}`);
    
    // Join user-specific room for personal notifications
    socket.join(`user:${user.id}`);

    // Handle appointment updates
    socket.on('appointment:subscribe', (appointmentId) => {
      socket.join(`appointment:${appointmentId}`);
    });

    socket.on('appointment:unsubscribe', (appointmentId) => {
      socket.leave(`appointment:${appointmentId}`);
    });

    // Handle customer updates
    socket.on('customer:subscribe', (customerId) => {
      socket.join(`customer:${customerId}`);
    });

    socket.on('customer:unsubscribe', (customerId) => {
      socket.leave(`customer:${customerId}`);
    });

    // Handle invoice updates
    socket.on('invoice:subscribe', (invoiceId) => {
      socket.join(`invoice:${invoiceId}`);
    });

    socket.on('invoice:unsubscribe', (invoiceId) => {
      socket.leave(`invoice:${invoiceId}`);
    });

    // Handle real-time messaging
    socket.on('message:typing', (data) => {
      socket.to(`customer:${data.customerId}`).emit('message:typing', {
        userId: user.id,
        userName: user.email.split('@')[0],
        customerId: data.customerId
      });
    });

    socket.on('message:stop_typing', (data) => {
      socket.to(`customer:${data.customerId}`).emit('message:stop_typing', {
        userId: user.id,
        customerId: data.customerId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${user.email} disconnected from WebSocket`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
}

// Utility functions for sending real-time updates
export const realtimeEvents = {
  // Appointment events
  appointmentCreated: (organizationId: string, appointment: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('appointment:created', appointment);
    }
  },

  appointmentUpdated: (organizationId: string, appointmentId: string, appointment: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('appointment:updated', appointment);
      io.to(`appointment:${appointmentId}`).emit('appointment:updated', appointment);
    }
  },

  appointmentDeleted: (organizationId: string, appointmentId: string) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('appointment:deleted', { id: appointmentId });
      io.to(`appointment:${appointmentId}`).emit('appointment:deleted', { id: appointmentId });
    }
  },

  // Customer events
  customerCreated: (organizationId: string, customer: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('customer:created', customer);
    }
  },

  customerUpdated: (organizationId: string, customerId: string, customer: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('customer:updated', customer);
      io.to(`customer:${customerId}`).emit('customer:updated', customer);
    }
  },

  // Invoice events
  invoiceCreated: (organizationId: string, invoice: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('invoice:created', invoice);
    }
  },

  invoiceUpdated: (organizationId: string, invoiceId: string, invoice: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('invoice:updated', invoice);
      io.to(`invoice:${invoiceId}`).emit('invoice:updated', invoice);
    }
  },

  invoicePaid: (organizationId: string, invoice: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('invoice:paid', invoice);
    }
  },

  // Message events
  messageReceived: (organizationId: string, customerId: string, message: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('message:received', message);
      io.to(`customer:${customerId}`).emit('message:received', message);
    }
  },

  messageSent: (organizationId: string, customerId: string, message: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('message:sent', message);
      io.to(`customer:${customerId}`).emit('message:sent', message);
    }
  },

  // System notifications
  systemNotification: (organizationId: string, notification: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('system:notification', notification);
    }
  },

  userNotification: (userId: string, notification: any) => {
    if (io) {
      io.to(`user:${userId}`).emit('user:notification', notification);
    }
  },

  // Analytics updates
  analyticsUpdate: (organizationId: string, analytics: any) => {
    if (io) {
      io.to(`org:${organizationId}`).emit('analytics:update', analytics);
    }
  }
};
