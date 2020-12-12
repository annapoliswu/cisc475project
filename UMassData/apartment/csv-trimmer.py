import csv
import datetime
least = datetime.datetime.strptime("2014-01-01 01:01:01", "%Y-%m-%d %H:%M:%S")
most = datetime.datetime.strptime("2017-01-01 01:01:01", "%Y-%m-%d %H:%M:%S")
localmost = datetime.datetime.strptime("2014-01-01 01:01:01", "%Y-%m-%d %H:%M:%S")
for i in range(1, 115):
    if (i != 3 and i!= 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) + "_total.csv", "r") as file1:
            reader = csv.reader(file1, delimiter=',', quotechar='|')
            index = 0
            for row in reader:
                if index == 0 and datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S") > least:
                    least = datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
                index = 1
                localmost = datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
            if localmost < most:
                most = localmost
    print(least, most)
for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) +"_total.csv", "r") as file1:
            reader = csv.reader(file1, delimiter=',', quotechar='|')
            with open("Apt" + str(i) + "_trimmed.csv", "w", newline='') as newfile:
                writer = csv.writer(newfile)
                for row in reader:
                    if datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S") >= least and datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S") <= most:
                        writer.writerow(row)
                    else:
                        print("Fail: ", row[0])
"""
for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) + "_trimmed.csv", "w", newline='') as newfile:
            writer = csv.writer(newfile)
            with open("2014/Apt" + str(i) +"_2014.csv", "r") as file1:
                reader = csv.reader(file1, delimiter=',', quotechar='|')
                for row in reader:
                    writer.writerow(row)
"""
