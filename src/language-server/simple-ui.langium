grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Main Part
Model:
    (p+=P | title+=Title | h1+=H1 | img+=Img)*;

// Implementation of HTML Tags

Title:
    'title' '{' text=STRING '}';

P:
    'p' '{' text=STRING (CSSOptionsText|'}');


H1:
    'h1' '{' text=STRING (CSSOptionsText|'}'); 

Img:
    'img' '{' url=STRING (CSSOptionsObject|'}');


// CSS Text related stuff

CSSOptionsText:
    ',' (color+=Color|sizepx+=Sizepx) (CSSOptionsText|'}');

Color:
    'color:' color=ID;

Sizepx:
    'sizepx:' size=INT;

// CSS Object related stuff
CSSOptionsObject:
    ',' (heightpx+=Heightpx|widthpx+=Widthpx) (CSSOptionsObject|'}');

Heightpx:
    'heightpx:' size=INT;

Widthpx:
    'widthpx:' size=INT;

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;
