// 'use client'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state type
interface AuthState {
    notification: boolean,
}

const initialState: AuthState = {
    notification: false,
};

const notifySlice = createSlice({
    name: 'notify',
    initialState,
    reducers: {
        on: (state, action: PayloadAction<any>) => {
            state.notification = action.payload;
        },
        off: (state) => {
            state.notification = false
        },
    }
});

export default notifySlice
export const { on, off } = notifySlice.actions;
