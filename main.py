import time
import requests
from flask import Flask
from threading import Thread
import os
 
token = "OTIzMTgyMjEzNzc5MDYyODA0.G1iSGR.S9qjc4Ap58b-cWVznNHmeu-7Xv5e_wlYOrhYeQ"
channel_id = "1074508165028257873"
 
count = 0
url = f"https://discord.com/api/v9/channels/{channel_id}/typing"
headers = {
  'authorization': token
}
 
 
app = Flask('')
 
@app.route('/')
def home():
	return ("Bot is up and running :D")
 
def run():
  app.run(
		host='0.0.0.0',
		port=8080
	)
 
def keep_alive():
	'''
	Creates and starts new thread that runs the function run.
	'''
	t = Thread(target=run)
	t.start()
 
keep_alive()
while True:
	response = requests.request("POST", url, headers=headers)
	if response.status_code != 204:
		print(response.text)
		print("Failed")
	else:
		count += 1
		print(f"Sent - {count}")
	time.sleep(3)