import * as FM from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import { useRef, useEffect } from 'react';

const videoConstraints = {
  facingMode: "user"
};

const videoStyle = {
  visibility: "hidden",
  width: 0,
  height: 0
};

const audioConstraints = {
  suppressLocalAudioPlayback: true,
  noiseSuppression: true,
  echoCancellation: true,
};

export default function MediapipeCameraWrapper({setLandmarks, WSP}) {

  const webcamRef = useRef(null);
  let camera = null;

  useEffect(() => {
    // set ML model
    const faceMesh = new FM.FaceMesh({
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

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks) {
        const landmarks = results.multiFaceLandmarks[0];

        // TODO: Send landmarks data here using track

        setLandmarks(landmarks);
      }
      
    }); // callback

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

  return (
    <Webcam 
      videoConstraints={videoConstraints}
      audioConstraints={audioConstraints}
      style={videoStyle} 
      audio={true}
      muted={true}
      ref={webcamRef}
      onUserMedia={(stream)=>{
        if (WSP !== undefined) {
          WSP.onUserMedia(stream)
        }
      }}
    />
  );
}