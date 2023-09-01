import {createSlice,PayloadAction} from '@reduxjs/toolkit'
import { createAsyncThunk } from '@reduxjs/toolkit';




export const AudioContext=window.AudioContext ;


export interface Songs{
    name:string,
    song:string,
    artist:string,
    songId:string,

}




export interface SongState{
    songs:Songs[],
    status:'idle' | 'loading'|'succeded' | 'failed',
    error:string | null,
    currentSongIndex:number
}


export const fetchSongs=createAsyncThunk('songs/fetchSongs',async()=>{
    const response=(await fetch('/music/songs.json'))
    console.log(response)
    return response.json();

})


const initialState: SongState = {
  
  songs:[],
  status:'idle',
  error:null,
  currentSongIndex:0
  
  
  
  
} as SongState;






export const songsSlice=createSlice({
    name:"songs",
    initialState,
    reducers:{
  
      playCurrentSong:(state,action:PayloadAction<number>)=>{
        
          state.currentSongIndex=action.payload
          
      },

      changeSong: (state, action: PayloadAction<'next' | 'prev'>): void => {
        if (action.payload === 'next') {
          state.currentSongIndex = (state.currentSongIndex + 1) % state.songs.length;
        } else if (action.payload === 'prev') {
          state.currentSongIndex = (state.currentSongIndex - 1 + state.songs.length) % state.songs.length;
        }
      },

      replaySong:(state,action:PayloadAction<number>):void=>{
         state.currentSongIndex=action.payload

      }
    },

    extraReducers(builder){
      builder.addCase(fetchSongs.pending,(state,action)=>{
        state.status='loading'
      }).addCase(fetchSongs.fulfilled,(state,action)=>{
        state.status='succeded';
        state.songs=action.payload;
      }).addCase(fetchSongs.rejected, (state,action)=>{
        state.status='failed';
        state.error=action.error.message || 'an error occured';
      })
    }
})

export const {playCurrentSong,changeSong,replaySong}= songsSlice.actions

export default songsSlice.reducer;