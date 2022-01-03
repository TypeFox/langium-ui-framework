import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { SimpleUi, SimpleUIAstType, UseComponent, Component, isStringExpression, isNumberExpression, Button } from './generated/ast';
import { SimpleUiServices } from './simple-ui-module';

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
            Button: validator.checkButton
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
        
        // Check type of parameters
        el.arguments.forEach(function (el, index) {
            if (isNumberExpression(el)) {
                if (refParameters[index].type === 'number') {
                    return
                }
                else {
                    accept('error', `Wrong parameter type 'number', expected parameter of type '${refParameters[index].type}'`, { node: el, property: 'value'})
                    return
                }
            }
            else if (isStringExpression(el)){
                if (refParameters[index].type === 'string') {
                    return
                }
                else {
                    accept('error', `Wrong parameter type 'string', expected parameter of type '${refParameters[index].type}'`, { node: el, property: 'value'});
                    return
                }
            }
        })
    }
    checkButton(el: Button, accept: ValidationAcceptor): void {
        const refParameters = el.onclickaction?.ref?.parameters
        el.arguments.forEach(function (el, index) {
            if (isNumberExpression(el)) {
                if (refParameters![index].type === 'number') {
                    return
                } else {
                    accept('error', `Wrong parameter type 'number', expected parameter of type '${refParameters![index].type}'`, {node: el, property: 'value'})
                    return
                }
            }
            else if (isStringExpression(el)) {
                if (refParameters![index].type === 'string') {
                    return
                }
                else {
                    accept('error', `Wrong parameter type 'string', expected parameter of type '${refParameters![index].type}'`, { node: el, property: 'value'});
                }
            }
        })
    }
}
