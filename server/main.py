import logging
from websocket_server import WebsocketServer
import json
from time import sleep
import time
import cv2
import mediapipe as mp

HOST = "127.0.0.1"
PORT = 5001

latestClient = {}

# Websocket server docs: https://github.com/Pithikos/python-websocket-server
def main():
    server = WebsocketServer(host=HOST, port=PORT)

    def new_client(client, server):
        print("New client has connected to the server")
        print(f"ID: {client['id']}, Address: {client['address']}")
        global latestClient
        latestClient = client

        data = "mock data"
        count = 0

        while client['id'] == latestClient['id']:
            count = count + 1
            pack = {'count': count, 'data': data}
            jsonPack = json.dumps(pack)
            server.send_message(latestClient, jsonPack)
            sleep(1)
        return
    
    server.set_fn_new_client(new_client)
    server.run_forever()

    
def WebSocket_face_mesh_trace_json():
    server = WebsocketServer(host=HOST, port=PORT)

    def new_client(client, server):
        print("New client has connected to the server")
        print(f"ID: {client['id']}, Address: {client['address']}")
        vid = cv2.VideoCapture(0)
        if not vid.isOpened():
            print("Cannot open camera")
            exit()

        mpFaceMesh = mp.solutions.face_mesh
        faceMesh = mpFaceMesh.FaceMesh(max_num_faces=1)

        frame_count = 0
        pTime = 0

        while True:
            success, frame = vid.read()
            if not success:
                print("Can't receive frame (stream end?). Exiting ...")
                break
            frame = frame[90:390, 170:470]
            frame = cv2.flip(frame, 1)
            frameRGB = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = faceMesh.process(frameRGB)

            cTime = time.time()
            fps = 1 / (cTime - pTime)
            pTime = cTime

            if results.multi_face_landmarks:
                package = []
                for index, mark in enumerate(results.multi_face_landmarks[0].landmark):
                    landmark = {'x': mark.x, 'y': mark.y, 'z': mark.z}
                    package.append({"landmark": landmark})
                frame_pack = {'fps': fps, 'frame': frame_count, 'payload': package}
                print("frame:", frame_pack['frame'], "fps:", frame_pack['fps'])
                jsonPack = json.dumps(frame_pack)

                server.send_message(client, jsonPack)
                #time.sleep(1)

            frame_count = frame_count + 1
            #print(frame_count)

    server.set_fn_new_client(new_client)
    server.run_forever()

    return 'TERMINATE'

        

        

    server.run_forever()

    return 'TERMINATE'

if __name__ == "__main__":
    main()