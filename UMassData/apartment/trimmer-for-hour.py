import csv
import datetime

for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) +"_15min.csv", "r") as file1:
            reader = csv.reader(file1, delimiter=',', quotechar='|')
            with open("Apt" + str(i) + "_15min-trimmed.csv", "w", newline='') as newfile:
                writer = csv.writer(newfile)
                index = 0
                for row in reader:
                    if index == 0:
                        minute = row[0][-5:-3]
                        if (minute == "00"):
                            writer.writerow(row)
                            index = 1
                    else:
                        writer.writerow(row)
