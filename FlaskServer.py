from threading import Thread
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from flask import jsonify
from datetime import datetime, timedelta, date
from statistics import mean
import time
import random
import sqlite3
import random


app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app)
thread = None

# Today's data:
today = []

# Both now and previous are in minute
now = 0
previous = 0
oneMinuteData = []


# Used in live data page: send data to the client every one minute(currently 2 seconds), in the meantime save it to database.
def send_data():
    previous = round((time.time()*1000)) # When we start the server, set the previous time.
    while True:
        # Generate random data every 2 seconds:
        time.sleep(2)
        value, timeStamp = generateRandomData()
        write_into_database(timeStamp, value)

        now = round((time.time()*1000)) # Every time we received the data, record current time and compare it with the previous time
        if(now - previous > 60000):# If the span is one minute
            avg = sum(oneMinuteData) / len(oneMinuteData)
            tempDic = {'date': previous, 'value': avg}
            today.append(tempDic)
            socketio.emit('message',today)
            previous = now
            oneMinuteData.clear()
        else:
            oneMinuteData.append(value)


        

def generateRandomData():
    value = random.random()
    currentTime = round((time.time()*1000)) # currentTime is milliseconds
    return value, currentTime

def write_into_database(timeStamp, value):
    con = sqlite3.connect('data.db')
    cur = con.cursor()
    cur.execute("INSERT INTO data (time, value) VALUES (?,?)",(timeStamp, value))
    con.commit()
    con.close()


def print_database():
    con = sqlite3.connect('data.db')
    data = con.execute('SELECT * FROM data')
    for row in data:
        print('Time: ', row[0])
        print('Value: ',row[1])

    con.close()


@app.route('/') # Define URL, index()_liveData() will process 'GET' request with this URL.
def index_liveData():
    global thread
    if thread is None:
        thread = Thread(target=send_data)
        thread.daemon = True
        thread.start()
    return render_template("index_liveData.html")


@socketio.on("Time span")
def send_history_data(message):
    valid, validFirstDate, validEndDate = dateIsValid(message['start'], message['end'])
    if not valid:
        validSpan = {"valid": "no", "validStartDate": validFirstDate.isoformat(), "validEndDate": validEndDate.isoformat()}
        socketio.emit("date feedback", validSpan)
    elif valid: # If the dates are valid, send history data to history page.
        s = 0
        e = 0
        if(type(message['start']) is str): # which means user didn't change date field on history page
            format_s = "%Y-%m-%d"
            datetime_start = datetime.strptime(message['start'], format_s)
            s = int(datetime_start.timestamp() * 1000)
        else:
            s = message['start']
         
        if(type(message['end']) is str):
            format_e = "%Y-%m-%d"
            datetime_end = datetime.strptime(message['end'], format_e)
            # 23*3600000 + 59*60000 + 59*1000 + 59 = 86399059
            e = int(datetime_end.timestamp()*1000 + 86399059)
        else:
            e = message['end']
        
    
            

        print("s: ", s)
        print("e: ", e)
        historyData = format_data_for_history_page(s, e)
        neededInfo = {"valid": "yes", "history data": historyData}
        socketio.emit("date feedback", neededInfo)
        


def dateIsValid(start_date, end_date):
    # Get the valid time span: firstDay ~ yesterday
    yesterday = date.today() - timedelta(days = 1)
    firstDay = date.fromtimestamp(firstDayInDb()//1000)
    print("firstDay: ", firstDay)
    # Convert milliseconds to date if needed:
    print("Start date: ", start_date)
    print("End date: ", end_date)
    if(type(start_date) is not str):
        startDate = date.fromtimestamp(int(start_date)//1000)
    else:
        format_str = "%Y-%m-%d"
        datetime_obj_start = datetime.strptime(start_date, format_str)
        startDate = datetime_obj_start.date()
    if(type(end_date) is not str):
        endDate = date.fromtimestamp(int(end_date)//1000)
    else:
        format_str = "%Y-%m-%d"
        datetime_obj_end = datetime.strptime(end_date, format_str)
        endDate = datetime_obj_end.date()  

    if(startDate <= endDate):
        print("startDate <= endDate")
    if(startDate >= firstDay):
        print("startDate >= firstDay")
    if(endDate <= yesterday):
        print("endDate <= yesterday")

    result = False
    if(startDate <= endDate and startDate >= firstDay and endDate <= yesterday):
        result = True
    return result, firstDay, yesterday


def firstDayInDb():
    con = sqlite3.connect('data.db')
    data = con.execute('SELECT * FROM data LIMIT 1')
    firstDay = None
    for row in data:
        firstDay = row[0]
    print("FirstDay: ", firstDay)
    return firstDay

# Given start date and end date as milliseconds, format the data
# so that it can be used by history page to display graph
def format_data_for_history_page(start, end):
    con = sqlite3.connect('data.db')
    # Set up the initial previous time:
    firstLine = con.execute('SELECT * FROM data WHERE time BETWEEN '+str(start)+' AND '+str(end)+' ORDER BY time LIMIT 1')
    previousTime = 0
    for row in firstLine:
        previousTime = row[0]

    # Extract and then format the data:
    history = []
    data = con.execute('SELECT * FROM data WHERE time BETWEEN '+str(start)+' AND '+str(end)+' ORDER BY time')
    tempOneMinuteData = []
    for row in data:
        currentTime = int(row[0])
        currentValue = float(row[1])
        if(currentTime - previousTime > 60000):
            avg = mean(tempOneMinuteData)
            tempDic = {'date': previousTime, 'value': avg}
            history.append(tempDic)
            previousTime = currentTime
            tempOneMinuteData.clear()
        else:
            tempOneMinuteData.append(currentValue)
    
    return history










    
@app.route('/changeGraph', methods = ['GET'])
def changeGraph():
    return jsonify(today)

@app.route("/index_history")
def index_history():
    return render_template("index_history.html")

# Create database and table
sql_createTable = "CREATE TABLE IF NOT EXISTS data (time INTEGER NOT NULL, value REAL NOT NULL)"
def init_db():
    con = sqlite3.connect('data.db')
    print("Database created!")
    con.execute(sql_createTable)
    print('Table created!')
    con.commit()
    con.close()
    print("Database closed")


if __name__ == '__main__':
    init_db()
    # temp = format_data_for_history_page(1625926266330, 1625929351180)
    # print(temp)
    socketio.run(app, debug = True)

