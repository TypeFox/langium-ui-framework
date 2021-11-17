grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Main Part
SimpleUi:
    (bodyelements+=BodyElement | headelements+=HeadElement | jselements+=JSElements | csstext+=CSSText | cssobject+=CSSObject)*;

HeadElement: Title;

BodyElement: UseComponent | Component | Div | Paragraph | Header | Image | Textbox | Button | Link | Linebreak | Label;

JSElements: Popup | JSFunction | Variable;

// Implementation of the <div> container

Div:
    'div' '{' content=SimpleUi '}';

// Implementation of HTML Tags

Title:
    'title' text=STRING; 

Paragraph:
    'paragraph' text=STRING ('{' 'id:' elementid=ID '}')?; 

Header:
    'header' text=STRING '{' 'headerlevel:' headerlevel=INT (',' 'id:' elementid=ID '}'| '}');

Label:
    'label' '{' 'for:' elementid=ID ',' 'labeltext:' labeltext=STRING '}';

Textbox:
    'textbox' name=ID ('{' 'placeholdertext:' placeholdertext=STRING '}')?;

Button:
    'button' buttontext=STRING ('{' 'onclick:' onclickaction=STRING '}')?;

Link:
    'link' linkurl=STRING ('{' 'linktext:' linktext=STRING '}')?;

Image:
    'image' imagepath=STRING ('{' 'id:' elementid=ID '}')?;

Linebreak:    
    {Linebreak} 'linebreak';

// CSS related stuff

Expression:
    StringExpression|NumberExpression;

StringExpression:
    value=(ID|STRING);

NumberExpression:
    value=INT;

// Text
CSSText:
    'csstext' for=ID '{' (properties+=CSSTextProperty (',' properties+=CSSTextProperty)*)? '}';

CSSTextProperty:
    property=('color'|'size')':' value=Expression;


// Image
CSSObject:
    'cssobject' for=ID '{' (properties+=CSSObjectProperty (',' properties+=CSSObjectProperty)*)? '}';

CSSObjectProperty:
    property=('width'|'height')':' value=Expression;

// JS Functions

Popup:
    'popup' '{' text=STRING '}';

JSFunction:
    'function' functionname=ID '{' content=SimpleUi '}';

Variable:
    'variable' varname=ID':' varvalue+=VariableExpression;

VariableExpression:
    value=(STRING|INT);

// Implementation of components (partly done)

Component:
    'component' name=ID '{' content=SimpleUi '}';

UseComponent:
    'usecomponent' component=[Component];

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;
