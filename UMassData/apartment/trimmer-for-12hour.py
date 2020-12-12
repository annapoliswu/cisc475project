import csv
import datetime

for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) +"_1hr.csv", "r") as file1:
            reader = csv.reader(file1, delimiter=',', quotechar='|')
            with open("Apt" + str(i) + "_1hr-trimmed.csv", "w", newline='') as newfile:
                writer = csv.writer(newfile)
                index = 0
                for row in reader:
                    if index == 0:
                        hour = row[0][-8:-6]
                        if (hour == "00" or hour == "12"):
                            writer.writerow(row)
                            index = 1
                            print("Check:", hour)
                        else:
                            print("Fail:", hour)
                    else:
                        writer.writerow(row)
                    
