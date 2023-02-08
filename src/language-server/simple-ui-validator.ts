import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
import { SimpleUiAstType, UseComponent, isStringExpression, isNumberExpression, Button, Heading, Parameter, CSSClasses } from './generated/ast';
import { SimpleUiServices } from './simple-ui-module';
import fs from 'fs';
import path from 'path';

/**
 * Map AST node types to validation checks.
 */
//type SimpleUiChecks = { [type in SimpleUiAstType]?: ValidationCheck | ValidationCheck[] }
const SimpleUiChecks: ValidationChecks<SimpleUiAstType> = {
    UseComponent: checkUseComponent,
    Button: checkButton,
    Heading: checkHeadingLevel,
    CSSClasses: checkCSSClasses
};

/**
 * Registry for validation checks.
 */
export class SimpleUiValidationRegistry extends ValidationRegistry {
    constructor(services: SimpleUiServices) {
        super(services);
        const checks: typeof SimpleUiChecks = {
            UseComponent: checkUseComponent,
            Button: checkButton,
            Heading: checkHeadingLevel,
            CSSClasses: checkCSSClasses
        };
        this.register(checks);
    }
}

function checkUseComponent(el: UseComponent, accept: ValidationAcceptor): void {
    //const refContent = el.component.ref?.content as BodyElement[];
    const refParameters = el.component.ref?.parameters as Parameter[];
    if (el.arguments.length !== refParameters?.length) {
        accept('error', `Number of parameters not matching (${el.arguments.length}), expected (${refParameters?.length}).`, {node: el, property: 'arguments'})
    } else {
        // Check type of parameters
        el.arguments.forEach((el, index) => {
            if (isNumberExpression(el) && refParameters[index].type !== 'number') {
                accept('error', `Wrong parameter type 'number', expected parameter of type '${refParameters[index].type}'.`, { node: el, property: 'value'})
            } else if (isStringExpression(el) && refParameters[index].type !== 'string') {
                accept('error', `Wrong parameter type 'string', expected parameter of type '${refParameters[index].type}'.`, { node: el, property: 'value'});
            }
        })
    }
}
    
function checkButton(el: Button, accept: ValidationAcceptor): void {
    const refParameters = el.onclickaction?.ref?.parameters
    // Check for the same number of parameters
    if (el.arguments.length !== refParameters?.length) {
        accept('error', `Number of parameters not matching (${el.arguments.length}), expected (${refParameters?.length}).`, {node: el, property: 'arguments'})
    } else {
        // Check type of parameters
        el.arguments.forEach((el, index) => {
            if (isNumberExpression(el) && refParameters![index].type !== 'number') {
                accept('error', `Wrong parameter type 'number', expected parameter of type '${refParameters![index].type}'.`, {node: el, property: 'value'})
            } else if (isStringExpression(el) && refParameters![index].type !== 'string') {
                accept('error', `Wrong parameter type 'string', expected parameter of type '${refParameters![index].type}'.`, { node: el, property: 'value'});
            }
        })
    }
}

function checkHeadingLevel(el: Heading, accept: ValidationAcceptor): void {
    if (el.level > 6 || el.level < 1) {
        accept('error', `Wrong headinglevel ${el.level}, expected value between 1 and 6.`, { node: el, property: 'level' })
    }
}

function checkCSSClasses(classes: CSSClasses, accept: ValidationAcceptor): void {
    const fileContent = fs.readFileSync(path.resolve(__dirname + '../../../src/assets/base.css'), 'utf8');
    const cssClasses = fileContent.match(/(?<=\.)[a-zA-Z\\d\-]*/gm);
    classes.classesNames
        .filter(name => name.trim().length > 0 && !cssClasses?.includes(name))
        .forEach(element => {
            accept('error', `Error: CSS Class ${element} does not exist.`, { node: classes, property: 'classesNames', index: classes.classesNames.indexOf(element) })
        });
}
