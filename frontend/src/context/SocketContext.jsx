/**
 * Socket Context - Provides Socket.IO connection to all components.
 * Manages connection lifecycle and exposes socket instance via React context.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Read socket URL from environment variable, with fallback to localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

/**
 * Custom hook to access the socket instance.
 * @returns {Socket|null} The Socket.IO client instance
 */
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

/**
 * Socket Provider component that initializes and manages the Socket.IO connection.
 */
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize Socket.IO connection
        const socketInstance = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            // Use polling only for ngrok free tier (blocks WebSockets)
            transports: ['polling'],
            // Add path for Socket.IO endpoint
            path: '/socket.io/'
        });

        // Connection event handlers
        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // NOTE: Setting socket state in useEffect is necessary here because
        // we need to initialize the socket connection and make it available
        // to consumers. This is a valid pattern for external resource initialization.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const value = {
        socket,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
