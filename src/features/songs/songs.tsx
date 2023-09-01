import React, {useState, useEffect, HTMLInputTypeAttribute, ReactElement } from "react";
import { playCurrentSong, changeSong, replaySong, fetchSongs, AudioContext } from './songsSlice';
import { AppDispatch, RootState } from '../../appStore/store';
import { useAppDispatch, useAppSelector } from "../../appStore/hooks";
import  Slider from '../../../src/components/Slider/Slider.component'; 
import './somgs.css';








const PlayComp:React.FC=function(){
    const stateSong=useAppSelector((state:RootState)=>state.songs);
    console.log(stateSong)
    const statestatus=useAppSelector((state: RootState)=>state.songs.status)
    const error = useAppSelector((state:RootState) => state.songs.error)
    const [loop,setLoop]=useState<boolean>(false);
    const [ischecked,setIsChecked]=useState<boolean>(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [audiocontext, setAudioContext] = useState<AudioContext | null>(null);
     const [playbackElement,setPlaybackElement] = useState<number>(0);
    const [slider,setSlider]=useState<HTMLInputElement | null >(null);
    const [play,setPlay]=useState<Boolean>(false);
    const [sliderValue,setSliderValue]=useState<number>(0);
    
    
    
    const dispatch=useAppDispatch();
    
    
    
   
    
   
   

    


    useEffect(()=>{
     

      
      if(statestatus === 'idle'){
        setTimeout(()=>{
          dispatch(fetchSongs())

          
        })
        
      }


    },[statestatus,dispatch]);

    let content:ReactElement;
    
    

    if(statestatus === 'loading'){
      content=<span >...loading</span>
    }else if(statestatus === 'failed'){
      content=<div>error</div>
    }
    

  useEffect(() => {
    setAudioElement(document.getElementById("audio-element") as HTMLAudioElement);
   
    setSlider(document.getElementById("slider-element") as HTMLInputElement);
  
  
    
  }, []);


 
  const handlePlayButtonClick = async () => {
    if (!audioElement) return;
  
    try {
      if (!audiocontext) {
        const context = new AudioContext();
        setAudioContext(context);
        const track = context.createMediaElementSource(audioElement);
        track.connect(context.destination);
  
        if (context.state === 'suspended') {
          await context.resume();
        }

        if (!play) {
          
          await audioElement.play();
          dispatch(playCurrentSong(stateSong.currentSongIndex));
          setPlay(true);
        } else {
          audioElement.pause();
          setPlay(false);
        }
      }else{
        if (!play) {

          await audioElement.play();
          dispatch(playCurrentSong(stateSong.currentSongIndex));
          setPlay(true);
        } else {
          audioElement.pause();
          setPlay(false);
        }

      }

  
     
    } catch (error) {
      console.error('Error during audio playback:', error);
    }
  };


  useEffect(()=>{
    if (!audioElement) return;

    let animationFrameId:any=null;

    const handleLoadMetaData=()=>{
      if(!slider) return;
      slider.min='0';
      const stepValue=0.1
      slider.max=audioElement.duration.toString();
      let answ:number=stepValue/audioElement.duration * 100
      slider.step=answ.toString()
       
    }

    audioElement.addEventListener('loadedmetadata', handleLoadMetaData);
  
    const handleTimeUpdate = () => {
      animationFrameId=requestAnimationFrame(()=>{
        setSliderValue(audioElement.currentTime);  
      
      })
      
      
    };
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    
   
   
    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadMetaData);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      cancelAnimationFrame(animationFrameId)
    }; 
  },[slider,audioElement]);

  const formatTime = (timeInSeconds: number):string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleChangePlayback=(e:React.ChangeEvent<HTMLInputElement>)=>{
  console.log(e.target.max)
    let value=parseInt(e.target.value);
      if(!audioElement) return;
        audioElement.currentTime =value;
    
       
        setPlaybackElement(value);
        
      
  }

  
 
 
const replaySongticket=()=>{
  
  setIsChecked(!ischecked)
  
  if(!audioElement) return ;

  if(ischecked){
  audioElement.removeEventListener('ended',replay)
  }else{
    audioElement.addEventListener('ended',replay)
  }

    }

  const replay=()=>{
    if(!audioElement) return;
     audioElement.currentTime=0;
     audioElement.play()

  }

  

  const handleChangePrevButton = async (e: React.MouseEvent) => {
    dispatch(changeSong('prev'));
  
    if (audioElement) {
      try {
        await audioElement.load();
        audioElement.play();
      } catch (error) {
        console.error('Error while loading and playing new song:', error);
      }
    }
  };
  
  const handleChangeButton = async () => {
    dispatch(changeSong('next'));
  
    if (audioElement) {
      try {
        await audioElement.load();
        audioElement.play();
      } catch (error) {
        console.error('Error while loading and playing new song:', error);
      }
    }
  };








    return(
        <div className='container'>
        
        <h1> Song Name:{ stateSong.songs[stateSong.currentSongIndex]?.name}</h1>
        <div className="audio-container">
        <audio  className="audio-map"   controls id="audio-element"  src={stateSong?.songs[stateSong.currentSongIndex]?.song} typeof="audio/mpeg"></audio>
        
       
        </div>
        <div>
        <button id='changeprev' onClick={handleChangePrevButton}>
          prev
        </button>

        <button id='change' onClick={handleChangeButton}>
          next
        </button>

        <button id="btn-play-pause" data-playing="false"  onClick={handlePlayButtonClick} >
          {play  ? 'pause':'play' }
        </button>

        <input   type="checkbox"  checked={ischecked}  onChange={replaySongticket}  name="loop"    /> 
         </div>
         <input type="range"
         id="play-backslider"
          onChange={handleChangePlayback}
          min={0}
          // step={0.1/audioElement?.duration}
          value={sliderValue}
          style={{width:"30%"}}
          />
          <span>{formatTime(sliderValue)}</span>
          <div style={{marginTop:'25px'}}>
          <Slider/>
          </div>
        </div>

        
    ) 
}



export default PlayComp;
