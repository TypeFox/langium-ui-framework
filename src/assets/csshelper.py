#!/usr/bin/env python3
"""
This python scipt extracts all the classes in a css file or txt list
than writes langium code in output.txt so you dont have todo this yourself
"""
import re

inputFile = raw_input("Input file: ")
print(inputFile)
input = open(inputFile, 'r')
output = open("output.txt", "w")

if inputFile.endswith(".css"):
    result = re.findall("(?<=\.).*?(?=[\s]?{)", input.read())
else:
    result = input.read().split("\n")

resultlist_len = len(result)-1
breakcount = 0
for name in result:
    if result.index(name) == resultlist_len:
        output.write("'" + name + "';")
    else:
        output.write("'" + name + "' | ")
    breakcount += 1
    if(breakcount == 25):
        output.write("\n")
        breakcount = 0