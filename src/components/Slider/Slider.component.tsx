import React from 'react';
import './Slider.css';



const Slider:React.FC=()=>{
    return (
        <div className="slider-container">
          <div className="slider-track"></div>
          <div className='slider-thumb'></div>
        </div>
    )
}



export default Slider;