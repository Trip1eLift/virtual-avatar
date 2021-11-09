# https://github.com/google/mediapipe/blob/master/mediapipe/python/solutions/face_mesh_connections.py

import face_mesh_connections as fmc
import json

def vertices_generate():
    Connections = fmc.FACEMESH_TESSELATION
    #print(Connections)
    count = 0

    vertices = []
    three_pair = []
    success = True
    for pair in Connections:
        if count % 3 == 0:
            if count != 0:
                if three_pair[0][0] != three_pair[2][1] or three_pair[0][1] != three_pair[1][0] or three_pair[1][1] != three_pair[2][0]:
                    print("Error", three_pair)
                    success = False
                else:
                    vertices.append([three_pair[0][0], three_pair[1][0], three_pair[2][0]])
            three_pair = []
            three_pair.append(pair)
        else:
            three_pair.append(pair)
        #print(pair)
        count = count + 1

    if (success == False):
        return
    
    raw_buffer = "["
    for vertice in vertices:
        temp_buffer = f"[{vertice[0]:>3}, {vertice[1]:>3}, {vertice[2]:>3}]" 
        raw_buffer = raw_buffer + "\n    " + temp_buffer + ","
    
    raw_buffer = raw_buffer[0:len(raw_buffer) - 1]
    raw_buffer = raw_buffer + "\n]"
    f = open("facemesh_vertices_mapping.json", "w")
    f.write(raw_buffer)
    f.close()


vertices_generate()