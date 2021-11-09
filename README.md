# Virtual-Avatar
This project involves a Python Server running Mediapipe with Webcam to 3D scan the face. Then send the facial landmarks to Client using websocket protocol. The Client is built on react with graphics engine @react-three/fiber that render facial landmark into browser.

## Python Server
To setup python virtual environment
```console
cd server
python3 -m venv ./venv
```

To activate
```console
where.exe python
./venv/Scripts/activate
where.exe python
```

Operation in venv
```console
pip list
py -m pip install -r requirements.txt
```

```console
deactivate
```

## React Client
To setup react environment
```console
cd client
npm install
```

To run
```console
yarn start
```
