import * as FM from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import { useRef, useEffect } from 'react';
import mock_data from './facemesh/landmarks-mock.json';
import * as THREE from 'three';

const videoConstraints = {
  facingMode: "user",
  frameRate: { ideal: 15, max: 30 }
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

export default function MediapipeCameraWrapper({setLandmarks, setCalibrateTransformation, WSP}) {

  const webcamRef = useRef(null);

  useEffect(() => {
    // set ML model
    const faceMesh = new FM.FaceMesh({
      locateFile:(file)=>{
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`; // load model file
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
        setLandmarks(landmarks);
      } else {
        setLandmarks(mock_data);
        const defaultTrans = {
          trans: [-mock_data[0].x, -mock_data[0].y+0.04, -mock_data[0].z],
          rotate: new THREE.Quaternion(0.9980121, -0.0152293, -0.0399953, 0.0462641),
        };
        setCalibrateTransformation(defaultTrans);
      }
      
    }); // callback

    if (typeof(webcamRef.current) !== "undefined" && webcamRef.current !== null) {
      //console.log(webcamRef.current.video);
      const camera = new cam.Camera(webcamRef.current.video, 
        {onFrame:async()=>{
          await faceMesh.send({image:webcamRef.current.video}) // run ML model
        },
        width: 640,
        height: 480
      });
      camera.start();
    }
  }, [setCalibrateTransformation, setLandmarks]);

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