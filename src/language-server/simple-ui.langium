grammar SimpleUi

// Initialization

entry SimpleUi:
    (headElements+=HeadElement | bodyElements+=BodyElement | jsFunctions+=JSFunction | parameters+=Parameter) *; 

HeadElement: Title | Icon;

BodyElement: SingleElement | NestingElement | UseComponent | Component;

SingleElement: 
    SingleHTMLElement classes=CSSClasses styles=InlineCSS;

NestingElement:
    NestingHTMLElement classes=CSSClasses styles=InlineCSS '{' content+=BodyElement* '}';


// List of single HTML Elements (HTML elements that do not contain other HTML elements). Add new ones here.
SingleHTMLElement returns SingleElement:  
    Paragraph | Heading | Image | Textbox | Button | Link | Linebreak | Topbar | Footer;

// List of nesting HTML Elements. Add new ones here.
NestingHTMLElement returns NestingElement: 
    Div | Section;

// CSS
CSSClasses:
    ('classes' '[' (classesNames+=CSSClass(',' classesNames+=CSSClass)*)? ']')?;

CSSClass returns string:
    ID (('-')* ID)*;

InlineCSS:
    ('styles' '[' (properties+=CSSProperty(',' properties+=CSSProperty)*)? ']')?;

CSSProperty:
    property=('text-color'|'font-size'|'width'|'height'|'background-color')':' value=Expression;

// NESTING HTML ELEMENTS
Div: 
    'div' name=ElementId?;  

Section: 
    'section' name=ElementId? description=STRING?;

// SINGLE HTML ELEMENTS
Paragraph:
    'paragraph' name=ElementId? text=Expression;

Heading:
    'heading' name=ElementId? 'level:'level=INT text=Expression;

Image:
    'image' name=ElementId? imagePath=Expression ('alt:' altText=Expression)?;

Textbox:
    'textbox' ElementId ('placeholder:' placeholderText=Expression)? ('label:' labelText=Expression (labelAfter?='labelafter')?)?;

Button:
    'button' name=ElementId? buttonText=Expression ('{' 'onClick:' onclickaction=[JSFunction:ID]('('(arguments+=Expression(',' arguments+=Expression)*)?')') '}')?;

Link:
    'link' name=ElementId? linkUrl=Expression ('text:' linkText=Expression)?;

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

ElementId:
    'id:' name=ID;


// JS implementation
JSModel:
    (jsElements+=JSElements)*;

JSElements: Popup;

Popup:
    'popup' text=Expression;

JSFunction:
    'function' name=ID ('('(parameters+=Parameter(',' parameters+=Parameter)*)?')')? '{' content=JSModel '}';

// Implementation of components

Component:
    'component' name=ID ('('(parameters+=Parameter(',' parameters+=Parameter)*)?')')? '{' content+=BodyElement* '}';

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
