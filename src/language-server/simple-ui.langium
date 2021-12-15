grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Initialization

SimpleUi:
    (bodyelements+=BodyElement | headelements+=HeadElement | CSSProperties+=CSSProperties | parameters+=Parameter | jsfunctions+=JSFunction)*;

HeadElement: Title;

BodyElement: UseComponent | Component | Div | Paragraph | Header | Image | Textbox | Button | Link | Linebreak | Label | Topbar;

JSModel:
    (jselements+=JSElements);

JSElements: Popup;

CSSElements: Paragraph | Header | Topbar | Image;

// Expression

Expression:
    SimpleExpression ({Operation.left=current} operator='+' right=SimpleExpression)*;

SimpleExpression:
    StringExpression|NumberExpression|SymbolReference;

StringExpression:
    value=STRING;

NumberExpression:
    value=INT;

SymbolReference:
    symbol=[Parameter];

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
    'button' buttontext=Expression ('{' 'onClick:' onclickaction=ID('('(arguments+=Expression(',' arguments+=Expression)*)?')')? '}')?;

Link:
    'link' linkurl=Expression ('{' 'linktext:' linktext=Expression '}')?;

Image:
    'image' imagepath=Expression ('{' (css+=CSSProperties(',' css+=CSSProperties)*) '}')?;

Linebreak:    
    {Linebreak} 'linebreak';

// CSS implementation

CSSProperties:
    property=('text-color'|'font-size'|'width'|'height'|'background-color')':' value=Expression;

// JS implementation

Popup:
    'popup' text=Expression;

JSFunction:
    'function' name=ID ('('(parameters+=Parameter(',' parameters+=Parameter)*)?')')? '{' content=JSModel '}';

// Implementation of components

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
