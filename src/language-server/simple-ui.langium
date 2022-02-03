grammar SimpleUi

// Initialization

entry SimpleUi:
    (headElements+=HeadElement | bodyElements+=BodyElement)*; 

HeadElement: Title | Icon;

BodyElement: SingleElement | NestingElement;
// UseComponent;

SingleElement: 
    SingleHTMLElement CSSClasses InlineCSS;

NestingElement:
    NestingHTMLElement CSSClasses InlineCSS '{' content+=BodyElement* '}';


// List of single HTML Elements (HTML elements that do not contain other HTML elements). Add new ones here.
SingleHTMLElement:  Paragraph | Heading | Image | Textbox | Button | Link | Linebreak | Topbar | Footer;
// List of nesting HTML Elements. Add new ones here.
NestingHTMLElement: Div | Section;

// CSS
fragment CSSClasses:
    ('classes' '[' (classes+=CSSClass(',' classes+=CSSClass)*)? ']')?;

CSSClass returns string:
    ID (('-')* ID)*;

fragment InlineCSS:
   ('styles' '[' (styles+=CSSProperty(',' styles+=CSSProperty)*)? ']')?;

CSSProperty:
    property=('text-color'|'font-size'|'width'|'height'|'background-color')':' value=Expression;

// NESTING HTML ELEMENTS
Div: 
    'div' name=ID?;  

Section: 
    'section' name=ID? description=STRING?;

// SINGLE HTML ELEMENTS
Paragraph:
    'paragraph' name=ID? text=Expression;

Heading:
    'heading' name=ID? 'level:'level=INT text=Expression;

Image:
    'image' name=ID? imagePath=Expression ('alt:' altText=STRING)?;

Textbox:
    'textbox' name=ID ('placeholder:' placeholderText=Expression)? ('label:' labelText=Expression (labelAfter?='labelafter')?)?;

Button:
    'button' name=ID? buttonText=Expression ('{' 'onClick:' onclickaction=[JSFunction:ID]('('(arguments+=Expression(',' arguments+=Expression)*)?')') '}')?;

Link:
    'link' name=ID? linkUrl=Expression 'text:' (linkText=Expression)?;

Linebreak:    
    {Linebreak} 'linebreak';

Topbar:
    'topbar' value=Expression (fixed?='fixed')?;

Footer:
    'footer' value=Expression;

// HEAD ELEMENTS
Title:
    'title' text=Expression; 

Icon:
    'icon' iconPath=Expression;

// CSSElements: Paragraph | Heading | Topbar | Image | Button | Link | Textbox | Div | Footer;

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


// JS implementation
JSModel:
    (jselements+=JSElements)*;

JSElements: Popup;

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
