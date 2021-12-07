grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Main Part
SimpleUi:
    (bodyelements+=BodyElement | headelements+=HeadElement | jselements+=JSElements | CSSProperties+=CSSProperties | parameters+=Parameter)*;

HeadElement: Title;

BodyElement: UseComponent | Component | Div | Paragraph | Header | Image | Textbox | Button | Link | Linebreak | Label | Topbar;

JSElements: Popup | JSFunction | Variable;

CSSElements: Paragraph | Header | Topbar | Image;

// Implementation of the <div> container

Div:
    'div' '{' content=SimpleUi '}';

// Implementation of HTML Tags

Title:
    'title' text=Expression; 

Topbar:
    'topbar' value=Expression ('{' (css+=CSSProperties(',' css+=CSSProperties)*) '}')?;

Paragraph:
    'paragraph' text=Expression ('{' (css+=CSSProperties(',' css+=CSSProperties)*) '}')?;

Header:
    'header' text=Expression '{' 'headerlevel:' headerlevel=INT (',' css+=CSSProperties(',' css+=CSSProperties)*)? '}';

Label:
    'label'  text=Expression '{' 'for:' elementid=ID (',' css+=CSSProperties(',' css+=CSSProperties)*)? '}';

Textbox:
    'textbox' name=ID ('{' 'placeholdertext:' placeholdertext=Expression '}')?;

Button:
    'button' buttontext=Expression ('{' 'onClick:' onclickaction=Expression '}')?;

Link:
    'link' linkurl=Expression ('{' 'linktext:' linktext=Expression '}')?;

Image:
    'image' imagepath=Expression ('{' (css+=CSSProperties(',' css+=CSSProperties)*) '}')?;

Linebreak:    
    {Linebreak} 'linebreak';

Expression:
    StringExpression|NumberExpression|SymbolReference;

StringExpression:
    value=STRING;

NumberExpression:
    value=INT;

SymbolReference:
    symbol=[Parameter];

// CSS related stuff

CSSProperties:
    property=('text-color'|'font-size'|'width'|'height'|'background-color')':' value=Expression;

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
    'usecomponent' component=[Component] ('('(arguments+=Expression(',' arguments+=Expression)*)?')')?;

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
