import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import About from './About';

export default function TopBar({Cal, MT, MTC, Settings, Skin, Stream, WSP}) {
	const [meshControlDialog, setMeshControlDialog] = useState(false);
	const [about, setAbout] = useState(false);
	const [streamControlDialog, setStreamControlDialog] = useState(false);
	const skin = Skin.getter;
	const setSkin = Skin.setter;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{backgroundColor:"grey"}}>
        <Toolbar>
					<MeshControlDraggableDialog open={meshControlDialog} setOpen={setMeshControlDialog} Cal={Cal} MT={MT} MTC={MTC} Settings={Settings} />
          <IconButton onClick={(e)=>setMeshControlDialog(true)} size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
					<StreamControlDialog open={streamControlDialog} setOpen={setStreamControlDialog} Stream={Stream} WSP={WSP}/>
					<Button color="inherit" onClick={(e)=>setStreamControlDialog(true)}>Stream</Button>
          <Typography variant="h6" component="div" align="center" sx={{ flexGrow: 1 }}>
            <div style={{cursor:"default"}}>Virtual Avatar</div>
          </Typography>
					<Button color="inherit" onClick={(e)=>setSkin(skin+1)}>Skin</Button>
          <Button color="inherit" onClick={(e)=>setAbout(true)}>About</Button>
					<About open={about} setOpen={setAbout} />
        </Toolbar>
      </AppBar>
    </Box>
  );
}

function MeshControlDraggableDialog({open, setOpen, Cal, MT, MTC, Settings}) {
	const setCalibrate = Cal.setter;
  return (
    <Dialog
			open={open}
			onClose={()=>setOpen(false)}
			PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
				Mesh Control
			</DialogTitle>
			<DialogContent>
				<div style={{width: "22rem"}}>Please position your face center and straight while hitting the calibrate button.</div>
				<MeshControlPanel MT={MT} MTC={MTC}/>
			</DialogContent>
			<DialogActions>
				<Button onClick={()=>MTC.setter({x_pos:50, y_pos:50, z_pos:50, yaw:50, pitch:50, roll:50})}>Reset</Button>
				<Button onClick={()=>setCalibrate(true)}>Calibrate</Button>
				<Button onClick={()=>Settings.save(false)}>Save</Button>
				<Button onClick={()=>Settings.load(false)}>Load</Button>
				<Button autoFocus onClick={()=>setOpen(false)}>Close</Button>
			</DialogActions>	

    </Dialog>
  );
}

function DraggablePaper(props) {
	return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

function MeshControlPanel({MT, MTC}) {
	// Let root level store the slider value so the value stays
	const x_pos = MTC.getter.x_pos;
	const y_pos = MTC.getter.y_pos;
	const z_pos = MTC.getter.z_pos;
	const yaw   = MTC.getter.yaw;
	const pitch = MTC.getter.pitch;
	const roll  = MTC.getter.roll;
	const setX_pos = (val) => MTC.setter({x_pos: val,   y_pos: y_pos, z_pos: z_pos, yaw: yaw, pitch: pitch, roll: roll});
	const setY_pos = (val) => MTC.setter({x_pos: x_pos, y_pos: val,   z_pos: z_pos, yaw: yaw, pitch: pitch, roll: roll});
	const setZ_pos = (val) => MTC.setter({x_pos: x_pos, y_pos: y_pos, z_pos: val,   yaw: yaw, pitch: pitch, roll: roll});
	const setYaw   = (val) => MTC.setter({x_pos: x_pos, y_pos: y_pos, z_pos: z_pos, yaw: val, pitch: pitch, roll: roll});
	const setPitch = (val) => MTC.setter({x_pos: x_pos, y_pos: y_pos, z_pos: z_pos, yaw: yaw, pitch: val  , roll: roll});
	const setRoll  = (val) => MTC.setter({x_pos: x_pos, y_pos: y_pos, z_pos: z_pos, yaw: yaw, pitch: pitch, roll: val });
	const setManualTransformation = MT.setter;

	useEffect(() => {
		const x = -(x_pos - 50) / 200;
		const y = (y_pos - 50) / 200;
		const z = (z_pos - 50) / 100;
		const yaw_q = new THREE.Quaternion();
		yaw_q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -(yaw-50)/100*Math.PI*2);
		const pitch_q = new THREE.Quaternion();
		pitch_q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (pitch-50)/100*Math.PI*2);
		const roll_q = new THREE.Quaternion();
		roll_q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), (roll-50)/100*Math.PI*2);
		var combine = new THREE.Quaternion().multiplyQuaternions(yaw_q, pitch_q);
		combine = new THREE.Quaternion().multiplyQuaternions(combine, roll_q);
		setManualTransformation({trans: [x, y, z], rotate: combine});
	}, [x_pos, y_pos, z_pos, yaw, pitch, roll]);
	
	return (
		<div style={{width:"22rem", marginTop:"1rem"}}>
			<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
				<div style={{width:"7rem"}}>X position</div>
				<Slider value={x_pos} onChange={(e, val)=>setX_pos(val)} />
      </Stack>
			<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
				<div style={{width:"7rem"}}>Y position</div>
				<Slider value={y_pos} onChange={(e, val)=>setY_pos(val)} />
      </Stack>
			<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
				<div style={{width:"7rem"}}>Z position</div>
				<Slider value={z_pos} onChange={(e, val)=>setZ_pos(val)} />
      </Stack>
			<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
				<div style={{width:"7rem"}}>Yaw</div>
				<Slider value={yaw} onChange={(e, val)=>setYaw(val)} />
      </Stack>
			<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
				<div style={{width:"7rem"}}>Pitch</div>
				<Slider value={pitch} onChange={(e, val)=>setPitch(val)} />
      </Stack>
			<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
				<div style={{width:"7rem"}}>Roll</div>
				<Slider value={roll} onChange={(e, val)=>setRoll(val)} />
      </Stack>
		</div>
	)
}

function StreamControlDialog({open, setOpen, Stream, WSP}) {
	const [roomId, setRoomId] = useState();
	const [disableRoomField, setDisableRoomField] = useState(false);
	const stream = Stream.getter;
	const setStream = Stream.setter;

	function createRoom(event) {
		setDisableRoomField(true);
		WSP.ownerConn(stream.url, setRoomId);
		setStream({start: true, url: stream.url});
	}

	function joinRoom(event) {
		// Click joinRoom to release roomField if it was locked.
		if (disableRoomField) {
			setDisableRoomField(false);
			setStream({start: false, url: stream.url});
			return;
		}

		WSP.guestConn(stream.url, roomId);
		setStream({start: true, url: stream.url});
	}

	function copyRoomUrl(event) {
		console.log("This functionality will be added later...");
	}

	return (
		<Dialog
			open={open}
			onClose={()=>setOpen(false)}
			PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
		>
			<DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
				Stream Control
			</DialogTitle>
			<TextField onChange={(e)=>setRoomId(e.target.value)} disabled={disableRoomField} InputLabelProps={{ shrink: disableRoomField }} value={roomId} id="outlined-multiline-flexible" label="joining room id" multiline maxRows={4} style={{width: "94%", margin: "5px", marginLeft: "3%", marginRight: "3%"}} />
			<DialogActions>
				<Button onClick={createRoom}>Create Room</Button>
				<Button onClick={joinRoom}>Join Room</Button>
				<Button onClick={copyRoomUrl}>Copy Room Url</Button>
				<Button autoFocus onClick={()=>setOpen(false)}>Close</Button>
			</DialogActions>
    </Dialog>
	)
}