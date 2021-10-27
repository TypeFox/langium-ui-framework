grammar SimpleUi
hidden(WS, SL_COMMENT, ML_COMMENT)

// Main Part
SimpleUi:
    (bodyelements+=BodyElement | headelements+=HeadElement | jselements+=JSElements)*;

HeadElement: Title;

BodyElement: UseComponent | Component | Div | Paragraph | Header | Image | Textbox | Button | Link | Linebreak | Label;

JSElements: JSFunctions;

// Implementation of the <div> container

Div:
    'div' '{' value=SimpleUi '}';

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

// CSS Text related stuff

CSSOptionsText:
    (color+=Color|sizepx+=Sizepx) (',' CSSOptionsText)?;

Color:
    'color:' color=STRING;

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
    'component' componentname=ID '{' content=SimpleUi '}';

UseComponent:
    'usecomp' compname=STRING;

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;
