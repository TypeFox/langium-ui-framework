"""
This python scipt extracts all the classes in the base.css file
than writes langium code in output.txt so you dont have todo this yourself
"""
import re

input = open("base.css", 'r')
output = open("output.txt", "w")
result = re.findall("(?<=\.).*?(?=[\s]?{)", input.read())

resultlist_len = len(result)-1
for name in result:
    if result.index(name) == resultlist_len:
        output.write("'" + name + "';")
    else:
        output.write("'" + name + "' | ")