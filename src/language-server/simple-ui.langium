grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Main Part
SimpleUi:
    (bodyelements+=BodyElement | headelements+=HeadElement | jselements+=JSElements | csselements+=CSSElements)*;

HeadElement: Title;

BodyElement: UseComponent | Component | Div | Paragraph | Header | Image | Textbox | Button | Link | Linebreak | Label;

JSElements: Popup | JSFunction | Variable;

CSSElements: CSSText | CSSObject;

CSSTextElements: Paragraph | Header;

CSSObjectElements: Image;

// Implementation of the <div> container

Div:
    'div' '{' content=SimpleUi '}';

// Implementation of HTML Tags

Title:
    'title' text=Expression; 

Paragraph:
    'paragraph' text=Expression ('{' (css+=CSSText(',' css+=CSSText)*) '}')?;

Header:
    'header' text=Expression '{' 'headerlevel:' headerlevel=INT (',' css+=CSSText(',' css+=CSSText)*)? '}';

Label:
    'label'  text=Expression '{' 'for:' elementid=ID (',' css+=CSSText(',' css+=CSSText)*)? '}';
Textbox:
    'textbox' name=ID ('{' 'placeholdertext:' placeholdertext=Expression '}')?;

Button:
    'button' buttontext=Expression ('{' 'onclick:' onclickaction=Expression '}')?;

Link:
    'link' linkurl=Expression ('{' 'linktext:' linktext=Expression '}')?;

Image:
    'image' imagepath=Expression ('{' (css+=CSSObject(',' css+=CSSObject)*) '}')?;
Linebreak:    
    {Linebreak} 'linebreak';

// CSS related stuff

Expression:
    StringExpression|NumberExpression|SymbolReference;

StringExpression:
    value=STRING;

NumberExpression:
    value=INT;

SymbolReference:
    symbol=[Parameter];

CSSText:
    property=('color'|'size')':' value=Expression;

CSSObject:
    property=('width'|'height')':' value=Expression;

// JS Functions

Popup:
    'popup' text=Expression;

JSFunction:
    'function' name=ID ('('(parameters+=Parameter(',' parameters+=Parameter)*)?')')? '{' content=SimpleUi '}';

Variable:
    'variable' name=ID':' varvalue+=VariableExpression;

VariableExpression:
    value=(STRING|INT);

// Implementation of components (partly done)

Component:
    'component' name=ID ('('(parameters+=Parameter(',' parameters+=Parameter)*)?')')? '{' content=SimpleUi '}';

UseComponent:
    'usecomponent' component=[Component];

Parameter:
    name=ID ':' type=Type;

Type returns string:
    'string' | 'number';

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;
