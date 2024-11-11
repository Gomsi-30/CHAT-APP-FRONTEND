// 'use client'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state type
interface AuthState {
    user: any
    isAdmin: boolean;
    loader: boolean;
}

const initialState: AuthState = {
    user: null,
    isAdmin: false,
    loader: true
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        userExists: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
            state.loader = false;
        },
        userNotExists: (state) => {
            state.user = false;
            state.loader = false;
        },
    }
});

export default authSlice
export const { userExists, userNotExists } = authSlice.actions;
