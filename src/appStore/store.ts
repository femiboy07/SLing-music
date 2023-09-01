import { configureStore } from "@reduxjs/toolkit";
import songsSlice from "../features/songs/songsSlice";




const store=configureStore({
    reducer:{
       songs:songsSlice,
    }
})


export type RootState=ReturnType<typeof store.getState>
export type AppDispatch=typeof store.dispatch



export default store;