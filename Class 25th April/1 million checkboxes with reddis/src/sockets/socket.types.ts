import type { Socket } from "socket.io";

export interface SocketData {
    userId: string;
}

export interface ClientToServerEvents {
    "client:checkbox:change": (data: {
        id: string;
        checked: boolean;
    }) => void;
}

export interface ServerToClientEvents {
    "server:checkbox:change": (data: {
        id: string;
        checked: boolean;
    }) => void;

    //! TODO: lets see what to do with this
    "error": (data: {
        message: string;
    }) => void;
}

export type AuthenticatedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
>;