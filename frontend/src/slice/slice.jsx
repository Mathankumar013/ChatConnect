import { createSlice } from "@reduxjs/toolkit";

const userReducer = createSlice({
    name:'chat',
    initialState:{
        user: null,
        theme: false
    },
    reducers:{
        toggleTheme:(state,action)=>{
            state.theme = !state.theme;
        },
        userData:(state,action)=>{
            state.user = action.payload;
        }
    }
})

export const { toggleTheme, userData} = userReducer.actions;

export default userReducer.reducer;