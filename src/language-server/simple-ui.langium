grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Main Part
SimpleUi:
    (usecomponent+=UseComponent | component+=Component | div+=Div | HTMLTags | JSFunctions)*;

// Implementation of the <div> container

Div:
    'div' '{' SimpleUi '}';

// Implementation of HTML Tags

HTMLTags:
    (p+=P | title+=Title | h1+=H1 | img+=Img | input+=Input | button+=Button);

Title:
    'title' text=STRING;

P:
    'paragraph' text=STRING ('{' CSSOptionsText '}')?;

H1:
    'header' text=STRING '{' HeaderLevel (',' CSSOptionsText '}'| '}');

Img:
    'image' url=STRING ('{' CSSOptionsObject'}'?);

Input:
    'input' name=ID ('{' 'basetext:' basetext=STRING '}')?;

Button:
    'button' buttontext=STRING ('{' 'onclick:' onclickaction=STRING '}')?; 

// Header sizes

HeaderLevel:
    'level:' level=INT;

// CSS Text related stuff

CSSOptionsText:
    (color+=Color|sizepx+=Sizepx) (',' CSSOptionsText)?;

Color:
    'color:' color=ID;

Sizepx:
    'sizepx:' size=INT;

// CSS Object related stuff

CSSOptionsObject:
    (heightpx+=Heightpx|widthpx+=Widthpx) (',' CSSOptionsObject)?;

Heightpx:
    'heightpx:' size=INT;

Widthpx:
    'widthpx:' size=INT;

// JS Functions

JSFunctions:
    (popup+=Popup | function+=Function);

Popup:
    'popup' popuptext=STRING;

Function:
    'function' functionname=ID '{' JSFunctions '}';

// Implementation of components

Component:
    'component' componentname=ID '{' SimpleUi '}';

UseComponent:
    'usecomp' compname=STRING;

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;
