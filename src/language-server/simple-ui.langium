grammar SimpleUi

// Initialization

entry SimpleUi:
    (bodyelements+=BodyElement | headelements+=HeadElement | CSSProperties+=CSSProperties | parameters+=Parameter | jsfunctions+=JSFunction)*;

HeadElement: Title;

BodyElement: UseComponent | Component | Div | Paragraph | Heading | Image | Textbox | Button | Link | Linebreak | Label | Topbar;

JSModel:
    (jselements+=JSElements)*;

JSElements: Popup;

CSSElements: Paragraph | Heading | Topbar | Image;

// Expression
Expression:
    Addition;

Addition returns Expression:
    Subtraction ({Operation.left=current} operator=('+') right=Subtraction)*;

Subtraction returns Expression:
    Division ({Operation.left=current} operator=('-') right=Division)*;

Division returns Expression:
    Multiplication ({Operation.left=current} operator=('/') right=Multiplication)*;

Multiplication returns Expression:
    Primary ({Operation.left=current} operator=('*') right=Primary)*;

Primary returns Expression:
    TextboxExpression | '(' Addition ')';

TextboxExpression:
    SimpleExpression | 'getTextbox' '('name=[Textbox:ID] ')';

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

Heading:
    'heading' text=Expression '{' 'headinglevel:' headinglevel=INT (',' css+=CSSProperties(',' css+=CSSProperties)*)? '}';

Label:
    'label'  text=Expression '{' 'for:' elementid=ID (',' css+=CSSProperties(',' css+=CSSProperties)*)? '}';

Textbox:
    'textbox' name=ID ('{' 'placeholdertext:' placeholdertext=Expression '}')?;

Button:
    'button' buttontext=Expression ('{' 'onClick:' onclickaction=[JSFunction:ID]('('(arguments+=Expression(',' arguments+=Expression)*)?')') '}')?;

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

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
