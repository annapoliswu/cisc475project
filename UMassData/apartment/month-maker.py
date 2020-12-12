import csv
import datetime

for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) +"_day-trimmed.csv", "r") as file1:
            reader = csv.reader(file1, delimiter=',', quotechar='|')
            with open("Apt" + str(i) + "_month.csv", "w", newline='') as newfile:
                writer = csv.writer(newfile)
                currentdate = ""
                currentamount = 0
                index = 0
                lastadd = False
                for row in reader:
                    if index == 0:
                        currentdate = row[0]
                        currentamount = float(row[1])
                        index = 1
                    else:
                        day = row[0][-11:-9]
                        if (day == "01"):
                            writer.writerow([currentdate, currentamount])
                            currentdate = row[0]
                            currentamount = float(row[1])
                            lastadd = False
                        else:
                            currentamount += float(row[1])
                            if (day =="32"):
                                lastadd = True
                if (lastadd == True):
                    writer.writerow([currentdate, currentamount])
                print(i)
