import logging
from websocket_server import WebsocketServer
import json
from time import sleep

HOST = "127.0.0.1"
PORT = 5001
HEADERSIZE = 10

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

    
    
        

        

    server.run_forever()

    return 'TERMINATE'

if __name__ == "__main__":
    main()