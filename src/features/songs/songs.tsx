import React, {useState, useEffect, ReactElement, useCallback,useRef } from "react";
import Volume from "../../components/Volume/Volumne.component";
import { changeSong, fetchSongs} from './songsSlice';
import {  RootState } from '../../appStore/store';
import { useAppDispatch, useAppSelector } from "../../appStore/hooks";
import  Slider from '../../../src/components/Slider/Slider.component'; 
import './somgs.css';
import Rewind from '../../imagessvg/fast_rewind_black_24dp.svg';
import  Play from '../../imagessvg/play_circle_filled_black_24dp.svg';
import  Pause from '../../imagessvg/pause_circle_filled_black_24dp.svg';
import  FastForward from '../../imagessvg/fast_forward_black_24dp.svg';
import Shuffle from '../../imagessvg/shuffle_black_24dp.svg';
import ShuffleOn from '../../imagessvg/shuffle_on_black_24dp.svg'








const PlayComp:React.FC=function(){
    const stateSong=useAppSelector((state:RootState)=>state.songs);
   const statestatus=useAppSelector((state: RootState)=>state.songs.status)
   const [ischecked,setIsChecked]=useState(false);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [audiocontext, setAudioContext] = useState<AudioContext | null>(null);
   const [play,setPlay]=useState<Boolean>(false);
    const [sliderValue,setSliderValue]=useState<number>(0);
    const [max,setMax]=useState<string>("");
    const [gain,setGain]=useState<GainNode | null>(null);
    const [statesSong ,setStateSong]=useState(stateSong);
    const [currentShuffledIndex, setCurrentShuffledIndex] = useState<number>(0);
    const [currentSongIndex,setCurrentSongIndex]=useState<number>(0)
    const [isShuffle,setShuffle]=useState(false);
    const [artist,setArtist]=useState('');
    const [name,setName]=useState( '');
   


   
    const dispatch=useAppDispatch();

    useEffect(() => {
      if (stateSong && stateSong.songs) {
        setArtist(stateSong.songs[stateSong.currentSongIndex]?.artist || 'Initial Artist Name');
        setName(stateSong.songs[stateSong.currentSongIndex]?.name || 'Initial Song Name');
      }
    }, [stateSong]);
    
   useEffect(()=>{
      if(!audioElement) return;
     if(statestatus === 'idle'){
        setTimeout(()=>{
          dispatch(fetchSongs())
     })
    }


    },[statestatus,dispatch,audioElement]);

    let content:ReactElement;
    
    

    if(statestatus === 'loading'){
      content=<span >...loading</span>
    }
    

  useEffect(() => {
    setAudioElement(document.getElementById("audio-element") as HTMLAudioElement);
    }, []);




   useEffect(() => {
    if(!audioElement) return;
    if (!audiocontext ) {
      
      // Create the AudioContext if it doesn't exist
      const context = new (window.AudioContext)();
      setAudioContext(context);
      const track = context.createMediaElementSource(audioElement);
        
      

        // track.connect(gainNode).connect(context.destination);
      // Create the gainNode
      const gain = context.createGain();
      setGain(gain);

      // Connect the gainNode to the destination (e.g., speakers)
      track.connect(gain).connect(context.destination);

    }
  }, [audiocontext,audioElement,play]); 
   

 
  const handlePlayButtonClick = async () => {
    if (!audioElement) return;
  
    try {
      if(!audiocontext )return;
        
        if (audiocontext?.state === 'suspended') {
           audiocontext.resume();
        }
        if (!play) {
           
          await audioElement.play();
          const currentSong=stateSong.songs[stateSong.currentSongIndex];
     
          setArtist(currentSong.artist);
          setName(currentSong.name);
          setPlay(true);
     
        } else {
          audioElement.pause();
          setPlay(false);
        }
      } catch (error) {
      console.error('Error during audio playback:', error);
    }
  };



 



  //shuffle algorithim works

 const shuffleSongs=useCallback(()=>{
     
    let shuffle=[...stateSong.songs];
    console.log(shuffle)

    for(var i=shuffle.length-1; i>0; i--){
      const randomIndex = Math.floor(Math.random() * (i + 1));

      // Swap the elements at randomIndex and i
      const temp = shuffle[i];
      console.log(temp);
      shuffle[i] = shuffle[randomIndex];
      shuffle[randomIndex] = temp;
    }
    return shuffle;

  },[stateSong.songs])

 
  const playNextSong = useCallback(() => {
    if(!audioElement) return
    // Check if the current song index is within bounds

    console.log('currentsomngindex',stateSong.currentSongIndex)
    // const nextIndex = stateSong.currentSongIndex + 1;
  
    // Check if the next index is within bounds
    if (stateSong.currentSongIndex < stateSong.songs.length &&  stateSong.currentSongIndex >=0 && stateSong.currentSongIndex !== undefined) {
      setCurrentSongIndex(stateSong.currentSongIndex + 1);
  
      // Load and play the next song
      const nextSong = stateSong.songs[stateSong.currentSongIndex + 1];
      console.log('Playing Next Song:', nextSong.name);
      audioElement.src = nextSong.song;
      setArtist(nextSong.artist);
      setName(nextSong.name);
  
      audioElement.load();
      audioElement.play();
    } else  {
      // If the next index is out of bounds, loop back to the first song
      const firstIndex = 0;
      const firstSong = stateSong.songs[firstIndex];
  
      setCurrentSongIndex(firstIndex);
  
      // Update the artist and song name
      setArtist(firstSong.artist);
      setName(firstSong.name);
  
      // Load and play the first song
      console.log('Looping Back to First Song:', firstSong.name);

      audioElement.src = firstSong.song;
      audioElement.load();
      audioElement.play();
    }
  }, [audioElement, stateSong]);

  
  
  
  const playNextRandomSong = useCallback(() => {
    if(!audioElement) return;
    let shuffledPlaylist=shuffleSongs();
    // Get the next random index from the shuffled playlist
    const randomIndex = Math.floor(Math.random() * shuffledPlaylist.length);
  
    // Set the current song index to the random index
  setCurrentSongIndex(randomIndex);
  
    // Load and play the selected song
    const selectedSong = shuffledPlaylist[randomIndex];
    audioElement.src = selectedSong.song;
    setArtist(selectedSong.artist);
    setName(selectedSong.name);
    audioElement.load();
    audioElement.play();
  },[audioElement,shuffleSongs]);


  
   

 
 

  useEffect(()=>{
    if(!audioElement) return
  
   
    const handleSongEnd = () => {
      if (isShuffle) {
        console.log('Shuffle is enabled'); 
        console.log(isShuffle)
       playNextRandomSong()
        
      }else if(ischecked){
        console.log('Repeat is enabled');
        console.log(ischecked)
        audioElement.currentTime=0;
        audioElement.play()
      }else{
        console.log('....playing next song')
        playNextSong()
      }
      
      
   };

  audioElement.addEventListener('ended', handleSongEnd);
    // Clean up the event listener when the component unmounts
    return () => {
      audioElement.removeEventListener('ended', handleSongEnd);
     
    };
  
  },[isShuffle,playNextRandomSong,audioElement,playNextSong,ischecked])

  


  const handleShuffleButtonClick = () => {
    let shuf=document.getElementById('shuffle')?.querySelector('img');
    
    
    if(!shuf) return;
    // shuf.style.fill='red';
    setShuffle((prevIsShuffleOn) => !prevIsShuffleOn);
  
    if (!isShuffle) {
      // If turning on shuffle mode, shuffle your playlist
      setIsChecked(false)
      const shuffledSongs = shuffleSongs();
      setStateSong({ ...statesSong,songs:shuffledSongs});
    }
  };
  


 

  const playNextShuffledSong = () => {
    setCurrentShuffledIndex((prevIndex) => {
      if (isShuffle) {
        console.log(isShuffle)
        const nextIndex = Math.floor(Math.random() * statesSong.songs.length);
        return nextIndex;
      } else if (prevIndex === statesSong.songs.length - 1) {
        return 0;
      } else {
        return prevIndex + 1;
      }
    });
  };
  


  const playPreviousShuffledSong = () => {
    setCurrentShuffledIndex((prevIndex) => {
      if (isShuffle) {
        const previousIndex = Math.floor(Math.random() * statesSong.songs.length);
        return previousIndex;
      } else if (prevIndex === 0) {
        return statesSong.songs.length - 1;
      } else {
        return prevIndex - 1;
      }
    });
  };
  



  const handleChangePrevButton = async () => {
   
  playPreviousShuffledSong()
    if (audioElement) {
      try {
  await handlePlayButtonClick().then(()=>{
    dispatch(changeSong('prev'));
    setPlay(true);

  })

  await audioElement.load();
  await audioElement.play()

  
      } catch (error) {
        console.error('Error while loading and playing new song:', error);
      }
    }
  };
  

  const handleChangeButton = async () => {
   
   playNextShuffledSong()
  
    if (audioElement) {
      try {
       await handlePlayButtonClick().then(()=>{
        dispatch(changeSong('next'));
        setPlay(true)
  
        
       })
       await audioElement.load();
       await audioElement.play()
      
      
        
      } catch (error) {
        console.error('Error while loading and playing new song:', error);
      }
    }
  };








    return(
      <div className='container'>
        <h2 style={{textAlign:'center'}}>{artist}</h2>
        <h5 style={{textAlign:'center'}}> {name}</h5>
        <div className="image-container">
        {/* <img src="" alt="the image "/> */}
        </div>
        <div className="audio-container">
        <audio  className="audio-map"  loop={false}  id="audio-element"  src={stateSong?.songs[stateSong.currentSongIndex]?.song} typeof="audio/mpeg"></audio>
        </div>

        {/**  another break **/}
        <div className="sec-controls">
        <div style={{marginTop:'25px'}}>
          <Slider  min={0}
           max={max} 
          play
           value={sliderValue} 
           audioElement={audioElement}/>
        </div>
       
       {/*controls  */}
       
       <div className='controlsA'>
        <button className='changeprev' color="red" type="button" onClick={handleChangePrevButton}>
          <img src={Rewind}  alt='rewind' className="first-img"/>
         </button>

       <button id="btn-play-pause" className="changeprev" data-playing="false"  onClick={handlePlayButtonClick} >
          {play  ? (
          <img 
          src= {Pause} 
          alt='pause' 
          className="first-img" />
          ):<img 
          src={Play} 
          alt ='play' 
          className="first-img" 
          color="red"/> 
          }
        </button> 

        <button id='change' className="changeprev" onClick={handleChangeButton}>
          <img src={FastForward} className="first-img" alt='fast'/>
        </button>
        
       </div>
       <div className="controlsB">
       <button className="littlecontrols" id="shuffle"  onClick={handleShuffleButtonClick}>
       {isShuffle ? 
       <img src={ShuffleOn} 
       alt='on' 
       className="littlecons"/>
       : <img 
       src={Shuffle}
      alt='shuffle'
      className="littlecon" />}
       </button>
      <input type="checkbox" className="checkbox-input" checked={!ischecked} id='repeatBox' onChange={()=>setIsChecked(!ischecked)} />
        <label htmlFor="repeatBox" className={`custom-checkbox ${ischecked ? 'checked' : ''}`} ></label>
      </div>
      
      {gain &&   <div style={{marginTop:'5px'}}>
      <Volume audioElement={audioElement} gain={gain}/>
      </div>}
    </div>
  </div>
  ) 
}



export default PlayComp;
