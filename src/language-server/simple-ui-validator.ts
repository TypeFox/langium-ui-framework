import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { CSSObject, CSSText, SimpleUiAstType } from './generated/ast';
import { SimpleUiServices } from './simple-ui-module';

/**
 * Map AST node types to validation checks.
 */
type SimpleUiChecks = { [type in SimpleUiAstType]?: ValidationCheck | ValidationCheck[] }

/**
 * Registry for validation checks.
 */
export class SimpleUiValidationRegistry extends ValidationRegistry {
    constructor(services: SimpleUiServices) {
        super(services);
        const validator = services.validation.SimpleUiValidator;
        const checks: SimpleUiChecks = {
            CSSText: validator.checkCSSTextProperties,
            CSSObject: validator.checkCSSObjectProperties
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class SimpleUiValidator {

    checkCSSTextProperties(csstext: CSSText, accept: ValidationAcceptor): void {
        if (typeof csstext.properties[0] === 'undefined') {
            accept('error', 'CSS properties should not be empty.', { node: csstext })
        }
    }

    checkCSSObjectProperties(cssobject: CSSObject, accept: ValidationAcceptor): void {
        if (typeof cssobject.properties[0] === 'undefined') {
            accept('error', 'CSS properties should not be empty.', { node: cssobject })
        }
    }


}
