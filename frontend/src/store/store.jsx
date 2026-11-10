import { configureStore } from "@reduxjs/toolkit";
import userReduce from '../slice/slice'

const store = configureStore({
    reducer:{
        chat: userReduce
    }
});
export default store;