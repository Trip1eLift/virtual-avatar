import './Scene.css';
import MediapipeCameraWrapper from "./MediapipeCameraWrapper";
import Facemesh from './facemesh/Facemesh';
import { useState, Suspense, useEffect } from 'react';
import { Canvas } from "@react-three/fiber";
import TopBar from './TopBar';
import * as THREE from 'three';
//import { OrbitControls } from '@react-three/drei';

export default function App() {

  const [landmarks, setLandmarks] = useState(undefined);
  const [firstUdf, setFirstUdf] = useState(true);
  const [calibrate, setCalibrate] = useState(false);
  const [calibrateTransformation, setCalibrateTransformation] = useState({trans: [0, 0, 0], rotate: new THREE.Quaternion()});
  const [manualTransformation, setManualTransformation] = useState({trans: [0, 0, 0], rotate: new THREE.Quaternion()});
  const [manualTransformationControl, setManualTransformationControl] = useState({x_pos: 50, y_pos: 50, z_pos: 50, yaw: 50, pitch:50, roll: 50});
  const [skin, setSkin] = useState(0);

  const Cal = {getter: calibrate, setter: setCalibrate};
  const CT = {getter: calibrateTransformation, setter: setCalibrateTransformation};
  const MT = {getter: manualTransformation, setter: setManualTransformation};
  const MTC = {getter: manualTransformationControl, setter: setManualTransformationControl};
  const Skin = {getter: skin, setter: setSkin};

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
      //console.log(results.multiFaceLandmarks[0][0]);
    }
  }

  return (
    <>
      <TopBar Cal={Cal} MT={MT} MTC={MTC} Settings={Settings} Skin={Skin} />

      <MediapipeCameraWrapper onResults={onResults}/>
      <Canvas>
        {/*<OrbitControls />*/}
        <ambientLight intensity={0.1} />
        <spotLight position={[10, 15, 20]} angle={0.5} intensity={0.8}/>
        <spotLight position={[-10, 15, 20]} angle={0.5} intensity={0.4}/>

        <Suspense fallback={null}>
          <Facemesh landmarks={landmarks} Cal={Cal} CT={CT} MT={MT} Skin={Skin} />
        </Suspense>
      </Canvas>
  </>
  );
}