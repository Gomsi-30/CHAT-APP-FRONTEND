import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Users = {
    _id: string;
    avatar: string;
    name: string;
};

const searchResult = createSlice({
    name: 'search',
    initialState: {
        users: [] as Users[],
    },
    reducers: {
        addUsers: (state, action: PayloadAction<Users[]>) => {
            state.users = action.payload; 
        },
        clearUsers : (state) => {
            state.users = [] 
        }
    }
});

export default searchResult
export const { addUsers, clearUsers } = searchResult.actions;
