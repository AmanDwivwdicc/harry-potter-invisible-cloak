import os
from flask import Flask
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import base64


from cloak import set_background, process_frame

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on("frame")
def handle_frame(data):
    img_data = base64.b64decode(data.split(",")[1])
    np_arr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    result = process_frame(frame)

    _, buffer = cv2.imencode(".jpg", result)
    encoded = base64.b64encode(buffer).decode("utf-8")

    emit("processed_frame", "data:image/jpeg;base64," + encoded)

@socketio.on("set_background")
def set_background_ws(data):
    print("🔥 set_background event received")

    print("DATA RECEIVED:", type(data))

    img_data = base64.b64decode(data.split(",")[1])
    np_arr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    set_background(frame)

    print("✅ Background stored successfully")

# if __name__ == "__main__":
#     socketio.run(app, debug=True)
    import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    socketio.run(
        app,
        host="0.0.0.0",
        port=port
    )