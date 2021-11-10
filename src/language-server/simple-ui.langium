grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Main Part
SimpleUi:
    (bodyelements+=BodyElement | headelements+=HeadElement | jselements+=JSElements | csstext+=CSSText | cssobject+=CSSObject)*;

HeadElement: Title;

BodyElement: UseComponent | Component | Div | Paragraph | Header | Image | Textbox | Button | Link | Linebreak | Label;

JSElements: JSFunctions;

// Implementation of the <div> container

Div:
    'div' '{' content=SimpleUi '}';

// Implementation of HTML Tags

Title:
    'title' text=STRING; //done

Paragraph:
    'paragraph' text=STRING ('{' 'id:' elementid=ID '}')?; //done

Header:
    'header' text=STRING '{' 'headerlevel:' headerlevel=INT (',' 'id:' elementid=ID '}'| '}'); //done

Label:
    'label' '{' 'for:' elementid=ID ',' 'labeltext:' labeltext=STRING '}'; //done

Textbox:
    'textbox' name=ID ('{' 'placeholdertext:' placeholdertext=STRING '}')?; //done

Button:
    'button' buttontext=STRING ('{' 'onclick:' onclickaction=STRING '}')?;  //done

Link:
    'link' linkurl=STRING ('{' 'linktext:' linktext=STRING '}')?; //done

Image:
    'image' imagepath=STRING ('{' 'id:' elementid=ID '}')?; //done

Linebreak:    
    {Linebreak} 'linebreak'; //done

// CSS related stuff

Expression:
    StringExpression|NumberExpression;

StringExpression:
    value=(ID|STRING);

NumberExpression:
    value=INT;

// Text
CSSText:
    'csstext' for=ID '{' (properties+=CSSTextProperty (',' properties+=CSSTextProperty)*)? '}'; //done

CSSTextProperty:
    property=('color'|'size')':' value=Expression; //done


// Image
CSSObject:
    'cssobject' for=ID '{' (properties+=CSSObjectProperty (',' properties+=CSSObjectProperty)*)? '}'; //done

CSSObjectProperty:
    property=('width'|'height')':' value=Expression; //done

// JS Functions (tbd)

JSFunctions:
    (popup+=Popup | jsfunction+=JSFunction); 

Popup:
    'popup' '{' text=STRING '}';

JSFunction:
    'function' functionname=ID '{' content=JSFunctions '}';

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
