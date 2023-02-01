import './Scene.css';
import MediapipeCameraWrapper from "./MediapipeCameraWrapper";
import {Facemesh, FacemeshControl} from './facemesh/Facemesh';
import { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from "@react-three/fiber";
import TopBar from './TopBar';
import * as THREE from 'three';
//import { OrbitControls } from '@react-three/drei';
import WebSocketPeering from './client2client/websocket-peering';
import { encodeFacemesh, decodeFacemesh } from './facemesh/encodeMeshData';

const backendUrl = "wss://virtualavatar-stream.trip1elift.com/";
//const backendUrl = "ws://localhost:5000/";

/**
 * TODO:
 * 1. Add copy link (domain name + query) http://localhost:3000/?room=3
 * 2. Handle domain name with query
 * 
 * TODO PRIO: find and fix memory leak (It happens without streaming, probably reltated to webgl)
 */

export default function AppRoot() {
  const [wsp, ] = useState(new WebSocketPeering());
  
  return (
    <App WSP={wsp} />
  );
}

function App({WSP}) {

  const [landmarks, setLandmarks] = useState(undefined);
  const [firstUdf, setFirstUdf] = useState(true);
  const [calibrate, setCalibrate] = useState(false);
  const [calibrateTransformation, setCalibrateTransformation] = useState({trans: [0, 0, 0], rotate: new THREE.Quaternion()});
  const [manualTransformation, setManualTransformation] = useState({trans: [0, 0, 0], rotate: new THREE.Quaternion()});
  const [manualTransformationControl, setManualTransformationControl] = useState({x_pos: 50, y_pos: 50, z_pos: 50, yaw: 50, pitch:50, roll: 50});
  const [skin, setSkin] = useState(0);
  const [stream, setStream] = useState({start: false, url: backendUrl});
  
  const [remoteFacemesh, setRemoteFacemesh] = useState();

  const remoteMedia = useRef(null);

  const Cal = {getter: calibrate, setter: setCalibrate};
  const CT = {getter: calibrateTransformation, setter: setCalibrateTransformation};
  const MT = {getter: manualTransformation, setter: setManualTransformation};
  const MTC = {getter: manualTransformationControl, setter: setManualTransformationControl};
  const Skin = {getter: skin, setter: setSkin};
  const Stream = {getter: stream, setter: setStream};

  useEffect(() => {
    WSP.setRemoteStream(remoteMedia);
    WSP.handleFacemeshData((buffer) => {
      //console.log(buffer);
      const obj = decodeFacemesh(buffer);
      setRemoteFacemesh(obj);
    });
  }, [WSP]);

  // // Send streaming data to remote
  useEffect(() => {
    // Encode and send data here
    if (WSP !== undefined && landmarks !== undefined && WSP.dc.readyState === "open") {
      const buffer = encodeFacemesh(skin, manualTransformation, calibrateTransformation, landmarks);
      WSP.sendFacemeshData(buffer);
    }
  }, [landmarks, WSP, calibrateTransformation, manualTransformation, skin]);

  function saveSettings() {
    const settings = {_Cal: Cal.getter, _CT: CT.getter, _MT: MT.getter, _MTC: MTC.getter, _Skin: Skin.getter}
    localStorage.setItem('calibrationSettings', JSON.stringify(settings));
  }

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('calibrationSettings'));
    if (settings == null)
      return false;
    Cal.setter(settings._Cal || false);
    CT.setter( settings._CT || {trans: [0, 0, 0], rotate: new THREE.Quaternion()});
    MT.setter( settings._MT || {trans: [0, 0, 0], rotate: new THREE.Quaternion()});
    MTC.setter(settings._MTC || {x_pos: 50, y_pos: 50, z_pos: 50, yaw: 50, pitch:50, roll: 50});
    Skin.setter(settings._Skin || 0);
    return true;
  }

  const Settings = {save: saveSettings, load: loadSettings};

  if (firstUdf === true && landmarks !== undefined) {
    // If settings is null, trigger calibration.
    if (!loadSettings()) {
      setCalibrate(true);
    }
    setFirstUdf(false);
  }

  return (
    <>
      <TopBar Cal={Cal} MT={MT} MTC={MTC} Settings={Settings} Skin={Skin} Stream={Stream} WSP={WSP} />
      <MediapipeCameraWrapper setLandmarks={setLandmarks} setCalibrateTransformation={setCalibrateTransformation} WSP={WSP} />
      <div style={canvasStyle(stream.start)}>
        <Canvas>
          {/*<OrbitControls />*/}
          <ambientLight intensity={0.1} />
          <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
          <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>

          <Suspense fallback={null}>
            <FacemeshControl landmarks={landmarks} Cal={Cal} CT={CT} MT={MT} Skin={Skin} WSP={WSP} />
          </Suspense>
        </Canvas>
      </div>
      <div style={canvasStyle(stream.start)}>
        {remoteFacemesh !== undefined && <Canvas>
          <ambientLight intensity={0.1} />
          <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
          <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>

          <Suspense fallback={null}>
            <Facemesh manualTransformation={remoteFacemesh.manualTransformation} transformation={remoteFacemesh.calibrateTransformation} points={remoteFacemesh.points} skin={remoteFacemesh.skin} />
          </Suspense>
        </Canvas>}
      </div>
      <audio ref={remoteMedia} autoPlay />
    </>
  );
}

function canvasStyle(stream_start) {
  if (stream_start) {
    return { display: "inline-block", position: "relative", width: "49%", height: "50%", borderStyle: "solid", borderWidth: "3px", borderColor: "white", borderRadius: "5px" };
  } else {
    return { position: "relative", width: "100%", height: "100%" };
  }
}