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
            readerfifteen = csv.reader(fifteenminutefile, delimiter=',', quotechar='|')
            for row in readerfifteen:
                fifteenminutecount += 1
                fifteenminutesum += float(row[1])
        with open("Apt" + str(i) +"_1hr.csv", "r") as hourfile:
            readerhour = csv.reader(hourfile, delimiter=',', quotechar='|')
            for row in readerhour:
                hourcount += 1
                hoursum += float(row[1])
        with open("Apt" + str(i) +"_12hr.csv", "r") as twelvehourfile:
            readertwelve = csv.reader(twelvehourfile, delimiter=',', quotechar='|')
            for row in readertwelve:
                twelvehourcount += 1
                twelvehoursum += float(row[1])
        with open("Apt" + str(i) +"_day.csv", "r") as dayfile:
            readerday = csv.reader(dayfile, delimiter=',', quotechar='|')
            for row in readerday:
                daycount += 1
                daysum += float(row[1])
        with open("Apt" + str(i) +"_month.csv", "r") as monthfile:
            readermonth = csv.reader(monthfile, delimiter=',', quotechar='|')
            for row in readermonth:
                monthcount += 1
                monthsum += float(row[1])
        with open("Apt" + str(i) +"_year.csv", "r") as yearfile:
            readeryear = csv.reader(yearfile, delimiter=',', quotechar='|')
            for row in readeryear:
                yearcount += 1
                yearsum += float(row[1])
print("15 min ave: ", fifteenminutesum/fifteenminutecount)
print("1 hour ave: ", hoursum/hourcount)
print("12 hour ave: ", twelvehoursum/twelvehourcount)
print("1 day ave: ", daysum/daycount)
print("1 month ave: ", monthsum/monthcount)
print("1 year ave: ", yearsum/yearcount)
