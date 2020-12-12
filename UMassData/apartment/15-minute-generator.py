import csv
import datetime

for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) +"_trimmed-2.csv", "r") as file1:
            reader = csv.reader(file1, delimiter=',', quotechar='|')
            with open("Apt" + str(i) + "_15min.csv", "w", newline='') as newfile:
                writer = csv.writer(newfile)
                currentdate = "2014-10-15 12:45:00"
                currentamount = 0
                index = 0
                for row in reader:
                    if index == 0:
                        currentdate = row[0]
                        currentamount = float(row[1])
                        index = 1
                    else:
                        minute = row[0][0:-3]
                        if (minute[-2:] == "00" or minute[-2:] == "15" or minute[-2:] == "30" or minute[-2:] == "45"):
                            writer.writerow([currentdate, currentamount])
                            currentdate = row[0]
                            currentamount = float(row[1])
                        else:
                            currentamount += float(row[1])
                writer.writerow([currentdate, currentamount])
                print(i)
