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

// Text
CSSText:
    'csstext' '{' 'for:' forid=ID (',' 'color:' color=ID)? (',' 'sizepx:' sizepx=INT )? '}';

// Image
CSSObject:
    'cssobject' '{' 'for:' forid=ID (',' 'heightpx:' heightpx=INT )? (',' 'widthpx:' widthpx=INT)? '}';

// JS Functions

JSFunctions:
    (popup+=Popup | function+=Function);

Popup:
    'popup' popuptext=STRING;

Function:
    'function' functionname=ID '{' JSFunctions '}';

// Implementation of components

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
