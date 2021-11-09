import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { CSSText, SimpleUiAstType } from './generated/ast';
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
            // Person: validator.checkPersonStartsWithCapital
            CSSText: validator.checkCSSTextProperties
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class SimpleUiValidator {

    // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
    //     if (person.name) {
    //         const firstChar = person.name.substring(0, 1);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Pers on name should start with a capital.', { node: person, property: 'name' });
    //         }
    //     }
    // }

    checkCSSTextProperties(csstext: CSSText, accept: ValidationAcceptor): void {
    }
}
