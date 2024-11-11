import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    id: string | null
}

const initialState: AuthState = {
    id: '',
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setId: (state, action: PayloadAction<string>) => {
            state.id = action.payload;
        },
        clearId: (state) => {
            state.id = ''
        },
    }
});

export default chatSlice
export const { setId, clearId  } = chatSlice.actions;
