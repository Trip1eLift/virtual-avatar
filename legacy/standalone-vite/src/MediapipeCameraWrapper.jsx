import {FaceMesh} from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import { useRef, useEffect } from 'react';

// Tutorial: https://www.youtube.com/watch?v=oNB5hVabqL4

export default function MediapipeCameraWrapper({onResults}) {

  const webcamRef = useRef(null);
  let camera = null;

  useEffect(() => {
    // set ML model
    const faceMesh = new FaceMesh({
      locateFile:(file)=>{
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`; // load model file
        // https://google.github.io/mediapipe/solutions/face_mesh#:~:text=return%20%60https%3A//cdn.jsdelivr.net/npm/%40mediapipe/face_mesh/%24%7Bfile%7D%60%3B
      }
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults); // callback

    if (typeof(webcamRef.current) !== "undefined" && webcamRef.current !== null) {
      //console.log(webcamRef.current.video);
      camera = new cam.Camera(webcamRef.current.video, 
        {onFrame:async()=>{
          await faceMesh.send({image:webcamRef.current.video}) // run ML model
        },
        width: 640,
        height: 480
      });
      camera.start();
    }
  }, []);

  const videoConstraints = {
    facingMode: "user"
  };

  const videoStyle = {
    visibility: "hidden",
    width: 0,
    height: 0
  }

  return (
    <Webcam videoConstraints={videoConstraints} ref={webcamRef} style={videoStyle} />
  );
}