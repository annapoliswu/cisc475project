import csv
import datetime

fifteenminutecount = 0
fifteenminutesum = 0
hourcount = 0
hoursum = 0
twelvehourcount = 0
twelvehoursum = 0
daycount = 0
daysum = 0
monthcount = 0
monthsum = 0
yearcount = 0
yearsum = 0
for i in range(1, 115):
    if (i != 3 and i != 6 and i != 21 and i != 65 and i != 94 and i != 112):
        with open("Apt" + str(i) +"_15min.csv", "r") as fifteenminutefile:
            fifteenminutecount += 1
            readerfifteen = csv.reader(fifteenminutefile, delimiter=',', quotechar='|')
            localMin = 1000000000000
            for row in readerfifteen:
                if (float(row[1]) <= localMin):
                    localMin = float(row[1])
            fifteenminutesum += localMin
        with open("Apt" + str(i) +"_1hr.csv", "r") as hourfile:
            hourcount += 1
            readerhour = csv.reader(hourfile, delimiter=',', quotechar='|')
            localMin = 1000000000000
            for row in readerhour:
                if (float(row[1]) <= localMin):
                    localMin = float(row[1])
            hoursum += localMin
        with open("Apt" + str(i) +"_12hr.csv", "r") as twelvehourfile:
            twelvehourcount += 1
            readertwelve = csv.reader(twelvehourfile, delimiter=',', quotechar='|')
            localMin = 1000000000000
            for row in readertwelve:
                if (float(row[1]) <= localMin):
                    localMin = float(row[1])
            twelvehoursum += localMin
        with open("Apt" + str(i) +"_day.csv", "r") as dayfile:
            daycount += 1
            readerday = csv.reader(dayfile, delimiter=',', quotechar='|')
            localMin = 1000000000000
            for row in readerday:
                if (float(row[1]) <= localMin):
                    localMin = float(row[1])
            daysum += localMin
        with open("Apt" + str(i) +"_month.csv", "r") as monthfile:
            monthcount += 1
            readermonth = csv.reader(monthfile, delimiter=',', quotechar='|')
            localMin = 1000000000000
            for row in readermonth:
                if (float(row[1]) <= localMin):
                    localMin = float(row[1])
            monthsum += localMin
        with open("Apt" + str(i) +"_year.csv", "r") as yearfile:
            yearcount += 1
            readeryear = csv.reader(yearfile, delimiter=',', quotechar='|')
            localMin = 1000000000000
            for row in readeryear:
                if (float(row[1]) <= localMin):
                    localMin = float(row[1])
            yearsum += localMin
print(yearsum)
print("15 min min ave: ", fifteenminutesum/fifteenminutecount)
print("1 hour min ave: ", hoursum/hourcount)
print("12 hour min ave: ", twelvehoursum/twelvehourcount)
print("1 day min ave: ", daysum/daycount)
print("1 month min ave: ", monthsum/monthcount)
print("1 year min ave: ", yearsum/yearcount)
