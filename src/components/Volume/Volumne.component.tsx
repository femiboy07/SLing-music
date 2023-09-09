import React,{useState,useRef,useCallback, useEffect} from "react";
import {ReactComponent as   LowVol} from '../../imagessvg/volume_down_black_24dp.svg';
import {ReactComponent as HighVol} from '../../imagessvg/volume_up_black_24dp.svg';
import './Volume.css';


interface VolumeProps{
    audioElement:HTMLAudioElement | null,
    gain:GainNode
}




const Volume:React.FC<VolumeProps>=({audioElement,gain})=>{
    // const [value,setValue]=useState<number >(0);
    const volThumb=useRef<HTMLDivElement | null>(null) ;
    const volTrackRef=useRef<HTMLDivElement | null>(null);
    const [thumbPosition, setThumbPosition] = useState<number>(0); // Store the initial thumb position;
    const [max,setMax]=useState<number>(3);
    const [min,setMin]=useState<number>(0);
    const [backgroundColor,setBackgroundColor]=useState<string>('#aeafb0')



   

 
 useEffect(() => {
  if (volThumb.current && volTrackRef.current) {
    const trackRect = volTrackRef.current.getBoundingClientRect();
    
    // Calculate the initial thumb position (e.g., starting in the middle of the track)
    const initialThumbPosition = (trackRect.width - volThumb.current.offsetWidth) / 3;

    // Calculate the initial gradient background based on the initialThumbPosition
    const gradientPercentage = (initialThumbPosition / (trackRect.width - volThumb.current.offsetWidth)) * 100;
    const gradientBackground = `linear-gradient(to right, red 0%, red ${gradientPercentage}%, gray ${gradientPercentage}%, gray 100%)`;
    
    // Set the initial background color
    setBackgroundColor(gradientBackground);
    
    // Set the initial thumb position
    setThumbPosition(initialThumbPosition);
  }
}, []);





 const handleTrack = useCallback((event: MouseEvent) => {
    if (!volTrackRef.current || !volThumb.current || !gain) return;
    if (!audioElement) return;

    const trackRect = volTrackRef.current.getBoundingClientRect();
    const clickX = event.clientX - trackRect.left;
    console.log(Math.max(0,clickX /trackRect.width),'clickx')
    const percentage = Math.min(1, Math.max(0, clickX / trackRect.width));

    // Calculate the new volume value based on the 
    let max:number|any=volTrackRef.current.ariaValueMax;
    setMax(max);
    
    const newVolume = percentage * max;

    // Update the gain node's volume
    gain.gain.value = newVolume;

    // Update the position of the thumb element
    const newThumbPosition = percentage * (trackRect.width - volThumb.current.offsetWidth);
    volThumb.current.style.left = `${newThumbPosition}px`;

    // Update the background color
    const gradientPercentage = (newThumbPosition / (trackRect.width - volThumb.current.offsetWidth)) * 100;
    const gradientBackground = `linear-gradient(to right, red 0%, red ${gradientPercentage}%, gray ${gradientPercentage}%, gray 100%)`;
    setBackgroundColor(gradientBackground);

    setThumbPosition(newThumbPosition);
}, [gain, audioElement]);
   


useEffect(()=>{
    
        let rail=volTrackRef.current;
        if(rail){
          rail.addEventListener('mousedown',handleTrack);
        }

        return ()=>{
         if(rail){
            rail.removeEventListener('mousedown',handleTrack)
         }
        }
 },[handleTrack])


   

    
    return(
        <>
        <div className="volume-container" >

        <LowVol style={{paddingRight:'5px',position:'absolute',top:'50%',bottom:'0',transform:'translateY(-50%)'}}/>
        <div className="vol-track" id="slider-me" style={{background:backgroundColor}}   ref={volTrackRef}   aria-valuemax={max} aria-valuemin={min}></div>
        <div className='vol-thumb' id='thumb-me' ref={volThumb} style={{ left: `${thumbPosition}px`,cursor:'pointer' }}></div>
        <HighVol  style={{paddingLeft:'5px',position:'absolute',top:'50%',bottom:'0',transform:'translateY(-50%)',right:0}}/>
       </div>
        </>
    )
}



export default Volume