// 'use client'
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/auth";
import searchResult from "./reducers/search-result";
import notifySlice from "./reducers/notification";
import chatSlice from "./reducers/chats";
import messsageSlice from "./reducers/message";

export type RootState = ReturnType<typeof store.getState>;

export const store = configureStore({
    reducer: {
        [authSlice.name]: authSlice.reducer,
        [notifySlice.name]: notifySlice.reducer,
        [chatSlice.name]: chatSlice.reducer,
        [searchResult.name] : searchResult.reducer,
        [messsageSlice.name] : messsageSlice.reducer
        
    },
});

export type AppDispatch = typeof store.dispatch;
