import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface messageState {
    notification : [{
        chatId : string,
        count : number
    }]
}

const initialState: messageState = {
    notification : [{
        chatId : '',
        count : 0
    }]
};

const messsageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setCount: (state, action: PayloadAction<string>) => {
            const idx = state.notification.findIndex(item=>item.chatId === action.payload);
            if(idx !== -1){
               state.notification[idx].count += 1
            }else{
                state.notification.push({
                    chatId : action.payload,
                    count : 1
                })
            }
        },
        clearCount: (state, action: PayloadAction<string>) => {
            const idx = state.notification.findIndex(item=>item.chatId === action.payload);
            if(idx === -1){
              return;
            }else{
                state.notification[idx].count = 0;
            }
        },
    }
});

export default messsageSlice
export const { setCount,clearCount  } = messsageSlice.actions;
