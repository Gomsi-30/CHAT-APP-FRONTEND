'use client'

import { useEffect } from "react";


export const socketsHook = (socket:any, handlers:any) => {
    useEffect(() => {
        Object.entries(handlers).forEach(([event, func]) => {
            socket.on(event, func);
        })
        return () => {
            Object.entries(handlers).forEach(([event, func]) => {
                socket.off(event, func);
            })
        }
    }, []);
}