import cv2
import numpy as np

background = None

def process_frame(frame):
    global background

    if background is None:
        print("❌ Background not set")
        return frame
    
def set_background(frame):
    global background
    background = frame
    print("Background set")

def process_frame(frame):
    global background

    if background is None:
        return frame  # ⚠️ safety fallback

    # frame = np.flip(frame, axis=1)
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # 🔴 RED DETECTION (broader range for real lighting)
    lower_red1 = np.array([0, 100, 50])
    upper_red1 = np.array([10, 255, 255])

    lower_red2 = np.array([170, 100, 50])
    upper_red2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)

    mask = mask1 + mask2

    kernel = np.ones((3,3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, kernel, iterations=1)

    mask_inv = cv2.bitwise_not(mask)

    # IMPORTANT FIX: ensure same size
    background_resized = cv2.resize(background, (frame.shape[1], frame.shape[0]))

    cloak_area = cv2.bitwise_and(background_resized, background_resized, mask=mask)
    current_area = cv2.bitwise_and(frame, frame, mask=mask_inv)

    final = cv2.addWeighted(cloak_area, 1, current_area, 1, 0)

    return final