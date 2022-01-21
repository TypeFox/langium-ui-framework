import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { SimpleUi, SimpleUIAstType, UseComponent, Component, isStringExpression, isNumberExpression, Button, Heading, Include } from './generated/ast';
import { SimpleUiServices } from './simple-ui-module';
import fs from 'fs';

/**
 * Map AST node types to validation checks.
 */
type SimpleUiChecks = { [type in SimpleUIAstType]?: ValidationCheck | ValidationCheck[] }

/**
 * Registry for validation checks.
 */
export class SimpleUiValidationRegistry extends ValidationRegistry {
    constructor(services: SimpleUiServices) {
        super(services);
        const validator = services.validation.SimpleUiValidator;
        const checks: SimpleUiChecks = {
            UseComponent: validator.checkUseComponent,
            Include: validator.checkIncludeFile,
            Button: validator.checkButton,
            Heading: validator.checkHeadingLevel
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class SimpleUiValidator {
    checkUseComponent(el: UseComponent, accept: ValidationAcceptor): void {
        const refContent = el.component.ref?.content as SimpleUi
        const refParameters = (refContent.$container as Component).parameters;
        if (el.arguments.length !== refParameters?.length) {
            accept('error', `Error: Number of parameters not matching (${el.arguments.length}), expected (${refParameters?.length}).`, {node: el, property: 'arguments'})
        } else {
            // Check type of parameters
            el.arguments.forEach(function (el, index) {
                if (isNumberExpression(el)) {
                    if (refParameters[index].type === 'number') {
                        return
                    }
                    else {
                        accept('error', `Error: Wrong parameter type 'number', expected parameter of type '${refParameters[index].type}'.`, { node: el, property: 'value'})
                        return
                    }
                }
                else if (isStringExpression(el)){
                    if (refParameters[index].type === 'string') {
                        return
                    }
                    else {
                        accept('error', `Error: Wrong parameter type 'string', expected parameter of type '${refParameters[index].type}'.`, { node: el, property: 'value'});
                        return
                    }
                }
            })
        }
    }
    checkIncludeFile(el: Include, accept: ValidationAcceptor): void {
        el.filenames.forEach((filename, index) => {
            if(el.filenames.includes(filename, index + 1)) {
                accept('warning', `Warning: Multible include is not necessary: '${filename}'.`, { node: el, property: 'filenames'});
            }
            filename += ".sui";
            if(!fs.existsSync(filename)) {
                accept('error', `Error: File was not found '${filename}'.`, { node: el, property: 'filenames'});
                return
            }        
        });     
    }
    checkButton(el: Button, accept: ValidationAcceptor): void {
        const refParameters = el.onclickaction?.ref?.parameters
        // Check for the same number of parameters
        if (el.arguments.length !== refParameters?.length) {
            accept('error', `Error: Number of parameters not matching (${el.arguments.length}), expected (${refParameters?.length}).`, {node: el, property: 'arguments'})
        } else {
            // Check type of parameters
            el.arguments.forEach(function (el, index) {
                if (isNumberExpression(el)) {
                    if (refParameters![index].type === 'number') {
                        return
                    } else {
                        accept('error', `Error: Wrong parameter type 'number', expected parameter of type '${refParameters![index].type}'.`, {node: el, property: 'value'})
                        return
                    }
                }
                else if (isStringExpression(el)) {
                    if (refParameters![index].type === 'string') {
                        return
                    }
                    else {
                        accept('error', `Error: Wrong parameter type 'string', expected parameter of type '${refParameters![index].type}'.`, { node: el, property: 'value'});
                    }
                }
            })
        }
    }
    checkHeadingLevel(el: Heading, accept: ValidationAcceptor): void {
        if (el.level > 6 || el.level < 1) {
            accept('error', `Error: Wrong headinglevel ${el.level}, expected value between 1 and 6.`, { node: el, property: 'level' })
        } 
        else {
            return
        }
    }
}
