import csv
import datetime
for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) + "_total.csv", "w", newline='') as newfile:
            writer = csv.writer(newfile)
            with open("2014/Apt" + str(i) +"_2014.csv", "r") as file1:
                reader = csv.reader(file1, delimiter=',', quotechar='|')
                for row in reader:
                    writer.writerow(row)
            with open("2015/Apt" + str(i) +"_2015.csv", "r") as file2:
                reader = csv.reader(file2, delimiter=',', quotechar='|')
                for row in reader:
                    writer.writerow(row)
            with open("2016/Apt" + str(i) +"_2016.csv", "r") as file3:
                reader = csv.reader(file3, delimiter=',', quotechar='|')
                for row in reader:
                    writer.writerow(row)
