import './Scene.css';
import MediapipeCameraWrapper from "./MediapipeCameraWrapper";
import {Facemesh, FacemeshDisplay} from './facemesh/Facemesh';
import { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from "@react-three/fiber";
import TopBar from './TopBar';
import * as THREE from 'three';
//import { OrbitControls } from '@react-three/drei';
import WebSocketPeering from './client2client/websocket-peering';

const backendUrl = "ws://localhost:5000";
//const wsp = new WebSocketPeering();

/**
 * TODO:
 * 1. Add chat popup panel as a top bar button
 * 2. Add creat room to the panel (zoom self to left 50%)
 * 3. Add join room input and button
 * 4. Add copy link (domain name + query) http://localhost:3000/?room=3
 * 
 * 5. Handle domain name with query
 */

export default function App() {

  const [landmarks, setLandmarks] = useState(undefined);
  const [firstUdf, setFirstUdf] = useState(true);
  const [calibrate, setCalibrate] = useState(false);
  const [calibrateTransformation, setCalibrateTransformation] = useState({trans: [0, 0, 0], rotate: new THREE.Quaternion()});
  const [manualTransformation, setManualTransformation] = useState({trans: [0, 0, 0], rotate: new THREE.Quaternion()});
  const [manualTransformationControl, setManualTransformationControl] = useState({x_pos: 50, y_pos: 50, z_pos: 50, yaw: 50, pitch:50, roll: 50});
  const [skin, setSkin] = useState(0);
  const [stream, setStream] = useState({start: false, url: backendUrl});
  const [wsp, setWsp] = useState();
  const [remoteFacemesh, setRemoteFacemesh] = useState();

  const remoteMedia = useRef(null);

  const Cal = {getter: calibrate, setter: setCalibrate};
  const CT = {getter: calibrateTransformation, setter: setCalibrateTransformation};
  const MT = {getter: manualTransformation, setter: setManualTransformation};
  const MTC = {getter: manualTransformationControl, setter: setManualTransformationControl};
  const Skin = {getter: skin, setter: setSkin};
  const Stream = {getter: stream, setter: setStream};

  useEffect(() => {
    const WSP = new WebSocketPeering();
    if (typeof(remoteMedia.current) !== "undefined" && remoteMedia.current !== null) {
      remoteMedia.current.srcObject = WSP.getRemoteStream();
      remoteMedia.current.onloadedmetadata = function(e) {
        remoteMedia.current.play();
      };
    }
    WSP.handleFacemeshData((data) => {
      // console.log("recieving data...");
      // console.log(data);
      setRemoteFacemesh(data);
    });

    setWsp(WSP);
  }, []);

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

  function onResults(results) {
    if (results.multiFaceLandmarks) {
      setLandmarks(results.multiFaceLandmarks[0]);
    }
  }

  var canvasStyle = { position: "relative", width: "100%", height: "100%" };
  if (stream.start) {
    canvasStyle = { display: "inline-block", position: "relative", width: "49%", height: "50%", borderStyle: "solid", borderWidth: "3px", borderColor: "white", borderRadius: "5px" };
  }

  return (
    <>
      <TopBar Cal={Cal} MT={MT} MTC={MTC} Settings={Settings} Skin={Skin} Stream={Stream} WSP={wsp} />
      {true && <MediapipeCameraWrapper onResults={onResults} WSP={wsp} />}
      <div style={canvasStyle}>
        {true && <Canvas>
          {/*<OrbitControls />*/}
          <ambientLight intensity={0.1} />
          <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
          <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>

          <Suspense fallback={null}>
            <Facemesh landmarks={landmarks} Cal={Cal} CT={CT} MT={MT} Skin={Skin} WSP={wsp} />
          </Suspense>
        </Canvas>}
      </div>
      <div style={canvasStyle}>
        {remoteFacemesh !== undefined && <Canvas>
          <ambientLight intensity={0.1} />
          <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
          <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>

          <Suspense fallback={null}>
            <FacemeshDisplay manualTransformation={remoteFacemesh.manualTransformation} transformation={remoteFacemesh.transformation} landmarks={remoteFacemesh.landmarks} skin={remoteFacemesh.skin} local={false}/>
          </Suspense>
        </Canvas>}
      </div>
      <audio ref={remoteMedia} autoPlay />
    </>
  );
}