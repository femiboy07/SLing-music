import React,{useCallback, useEffect, useRef, useState} from 'react';
import './Slider.css';


interface sliderProps{
   min:number,
   max:string,
   value:number,
   play:boolean,
   audioElement:HTMLAudioElement | null
}



const Slider:React.FC<sliderProps>=({value,audioElement,play})=>{
  const refThumb=useRef<HTMLDivElement | null>(null) ;
  const trackRef=useRef<HTMLDivElement | null>(null);
  const isDragging=useRef(false);
  const [thumbPosition, setThumbPosition] = useState<number>(0);
  const isClicking = useRef(false); 
  const initialThumbPosition = useRef<number | null>(null); // Store the initial thumb position;
  const [max,setMax]=useState<number>(0);
  const [min,setMin]=useState<number>(0);
  const [slider,setSlider]=useState<HTMLDivElement | null >(null); 
  const [time,setTime]=useState<number >(0);
  const [playbackElement,setPlaybackElement]=useState<number>(0);
  const [backgroundColor,setBackgroundColor]=useState<string>('#aeafb0');
  const [gone,setGone]=useState<number>(0);
  


 


 
  useEffect(() => {
    setSlider(document.getElementById("slider") as HTMLInputElement);
 }, []); 

  



  
  const handleMouseMove =useCallback(async(event: MouseEvent)=> {
    if (!isDragging.current || !trackRef.current || !refThumb.current) return;
    if(!audioElement) return

    

    // Calculate the new thumb position based on mouse movement within the track
    const trackRect = trackRef.current.getBoundingClientRect();
   
   
    const offsetX = event.clientX - trackRect.left;
  
    const maxThumbPosition = trackRect.width - refThumb.current.offsetWidth;
  
    const newThumbPosition = Math.min(
      Math.max(0,  offsetX),
    
      maxThumbPosition
    );

    // Update the position of the thumb element
    refThumb.current.style.left = `${newThumbPosition}px`;
  
   
  
   
     
    setThumbPosition(newThumbPosition);
    
    const maxAudioDuration = audioElement.duration;
    const newAudioTime =
      (newThumbPosition / (trackRect.width - refThumb.current.offsetWidth)) *
      maxAudioDuration;
    audioElement.currentTime = newAudioTime;
    
   
  
    // Resume audio playback
   


  },[audioElement])



  const handleMouseUp=useCallback(()=> {
  
    
    // Reset the dragging flag
    isDragging.current = false;
   initialThumbPosition.current=null

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

  },[handleMouseMove]) 

   


  const handleDraggable=useCallback((event:MouseEvent)=>{
    event.preventDefault();
  
    isDragging.current=true;
    // initialThumbPosition.current=thumbPosition;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);   
  },[handleMouseMove,handleMouseUp])


  const handleTrackClick =useCallback((event: MouseEvent) => {
    if (!trackRef.current || !refThumb.current) return;
    if(!audioElement) return;

    isClicking.current=true
    isDragging.current=false

    // Calculate the new thumb position based on the click event's clientX
    const trackRect = trackRef.current.getBoundingClientRect();
 
    const clickX = event.clientX - trackRect.left;
   
    const newThumbPosition = Math.min(
      Math.max(0, clickX - refThumb.current.offsetWidth / 2), // Center the thumb under the cursor
      trackRect.width - refThumb.current.offsetWidth
    );

    // Update the position of the thumb element
    refThumb.current.style.left = `${newThumbPosition}px`;

    // Calculate the new value based on the thumb's position within the track
   

    // Set the state to reflect the thumb's position
    setThumbPosition(newThumbPosition);
    


  const maxAudioDuration = audioElement.duration;
  const newAudioTime =
  (newThumbPosition / (trackRect.width - refThumb.current.offsetWidth)) *
  maxAudioDuration;
audioElement.currentTime = newAudioTime;

  },[audioElement]);

   
  

  useEffect(() => {
    // Attach the mouse down event listener to the track element
    let track=refThumb.current;
    let me:number|any = audioElement?.duration;
    setMax(me)
    setMin(0);
   
    if (track) {
      track.addEventListener('mousedown', handleDraggable);
      
    }

    let rail=trackRef.current;

    if(rail){
      rail.addEventListener('mousedown',handleTrackClick);

    }

    // Cleanup when the component unmounts
    return () => {
      if (track) {
        track?.removeEventListener('mousedown', handleDraggable);
      }
       if(rail){
      rail?.removeEventListener('mousedown',handleTrackClick);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleTrackClick,audioElement?.duration,handleMouseMove,handleMouseUp,handleDraggable]);

  
  
  



  
  
  useEffect(()=>{
    if (!audioElement) return;

    let animationFrameId:any=null;
    let stepValue:number=0.1;

    const handleLoadMetaData=()=>{
      if(!slider) return;
      slider.ariaValueMin='0';
      setMin(parseInt(slider.ariaValueMin))
      // const stepValue=0.1
      slider.ariaValueMax=audioElement.duration.toString();
      setMax(parseFloat(slider.ariaValueMax))
     
       
    }

    audioElement.addEventListener('loadedmetadata', handleLoadMetaData);
  
    const handleTimeUpdate = () => {
      if(!trackRef.current  || !refThumb.current) return;

      var trackRect = trackRef.current.getBoundingClientRect();
      animationFrameId=requestAnimationFrame(()=>{
        if(!trackRef.current  || !refThumb.current) return;

        const maxThumbPosition = trackRect.width - refThumb.current.offsetWidth;
        const audioCurrentTime = audioElement.currentTime;
        const maxAudioDuration = audioElement.duration;
        const newThumbPosition = (audioCurrentTime / maxAudioDuration) * maxThumbPosition;
        refThumb.current.style.left = `${newThumbPosition}px`;

       
        if (thumbPosition === 0) {
          setBackgroundColor('#aeafb0'); // Reset background color when thumb is at the beginning
        } else {
          // Calculate the gradient background based on the thumb's position
          // const maxThumbPosition = trackRect.width - refThumb.current.offsetWidth;
          const gradientPercentage = (thumbPosition / maxThumbPosition) * 100;
          const gradientBackground = `linear-gradient(to right, red 0%, red ${gradientPercentage}%, gray ${gradientPercentage}%, gray 100%)`;
          setBackgroundColor(gradientBackground);
        }
    
       setThumbPosition(newThumbPosition);
  


        // setSliderValue(audioElement.currentTime);
        setTime(audioElement.currentTime);

        let timegone=audioElement.duration - audioCurrentTime;
        
        setGone(timegone);
         
      
      })
      
      
    };
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    
   
   
    return () => {
      audioElement.removeEventListener('loadedmetadata', handleLoadMetaData);
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      cancelAnimationFrame(animationFrameId)
    }; 
  },[slider,audioElement,max,min,thumbPosition]);

  
  const handleChangePlayback=(e:React.ChangeEvent<HTMLDivElement>)=>{
    if(!trackRef.current  || !refThumb.current) return;
    if (!audioElement) return;

      var trackRect = trackRef.current.getBoundingClientRect();
      
      const maxThumbPosition = trackRect.width - refThumb.current.offsetWidth;
      const audioCurrentTime = audioElement.currentTime;
      const maxAudioDuration = audioElement.duration;
      const newThumbPosition = (audioCurrentTime / maxAudioDuration) * maxThumbPosition;
      const newValue = (newThumbPosition / maxThumbPosition) * (max - min) + min;

      let value:any=e.target.ariaValueNow;
        if(!audioElement) return;
        
          audioElement.currentTime =value;
        
        
          setPlaybackElement(newValue);
         
          
          if(!play){
            audioElement.play()
          }else{
            audioElement.pause()
          }
           
       
    }
  const formatTime = (timeInSeconds: number):string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }; 


 


    return (
      <>
      
      <div className="slider-container">
          <div className="slider-track" id="slider" aria-valuenow={value} style={{background:backgroundColor}} onChange={handleChangePlayback}   aria-valuemin={min} aria-valuemax={max}  role="slider" ref={trackRef} ></div>
          <div className='slider-thumb' id='thumb' onMouseDown={()=>handleDraggable}  ref={refThumb}  style={{ left: `${thumbPosition}px`,cursor:'pointer' }}></div>
          <h5 style={{position:'absolute',bottom:0,left:0}}>{formatTime(time)}</h5>
          {gone ? <h5 style={{position:'absolute',bottom:0,right:0}}>{formatTime(gone)}</h5>:<h5 style={{position:'absolute',bottom:0,right:0}}>0:00</h5>}
       </div>
     
      </>
      
    )
}



export default Slider;