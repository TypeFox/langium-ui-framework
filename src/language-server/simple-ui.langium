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
SingleHTMLElement infer SingleElement:  
    Paragraph | Heading | Image | Textbox | Button | Link | Linebreak | Topbar | Footer;

// List of nesting HTML Elements. Add new ones here.
NestingHTMLElement infer NestingElement: 
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
    'div' ElementName?;  

Section: 
    'section' ElementName? description=STRING?;

// SINGLE HTML ELEMENTS
Paragraph:
    'paragraph' ElementName? text=Expression;

Heading:
    'heading' ElementName? 'level:'level=INT text=Expression;

Image:
    'image' ElementName? imagePath=Expression ('alt:' altText=Expression)?;

Textbox:
    'textbox' ElementName ('placeholder:' placeholderText=Expression)? ('label:' labelText=Expression (labelAfter?='labelafter')?)?;

Button:
    'button' ElementName? buttonText=Expression ('{' 'onClick:' onclickaction=[JSFunction:ID]('('(arguments+=Expression(',' arguments+=Expression)*)?')') '}')?;

Link:
    'link' ElementName? linkUrl=Expression ('text:' linkText=Expression)?;

Linebreak:    
    {infer Linebreak} 'linebreak';

Topbar:
    'topbar' value=Expression (fixed?='fixed')? ('navlinks:' ((autoNavLinks?='auto')|('['sectionsList+=[Section:ID](','sectionsList+=[Section:ID])*']')))?;

Footer:
    'footer' value=Expression;

fragment ElementName:
    name=ID;

// HEAD ELEMENTS
Title:
    'title' text=Expression; 

Icon:
    'icon' iconPath=Expression;

// CSSElements: Paragraph | Heading | Topbar | Image | Button | Link | Textbox | Div | Footer;

// Expression
Expression:
    Addition;

Addition infer Expression:
    Subtraction ({infer Operation.left=current} operator=('+') right=Subtraction)*;

Subtraction infer Expression:
    Division ({infer Operation.left=current} operator=('-') right=Division)*;

Division infer Expression:
    Multiplication ({infer Operation.left=current} operator=('/') right=Multiplication)*;

Multiplication infer Expression:
    Primary ({infer Operation.left=current} operator=('*') right=Primary)*;

Primary infer Expression:
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
    '$[' symbol=[Parameter] ']';


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
