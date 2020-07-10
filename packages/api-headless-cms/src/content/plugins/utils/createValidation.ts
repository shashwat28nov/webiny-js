import {
    CmsContext,
    CmsContentModelField,
    CmsModelFieldValidatorPlugin,
    CmsFieldValidation
} from "@webiny/api-headless-cms/types";
import { getI18NValue } from "./getI18NValue";

type RunValidationParams = {
    plugins: CmsModelFieldValidatorPlugin[];
    validations: CmsFieldValidation[];
    value: any;
    context: CmsContext;
};

const runValidations = async (params: RunValidationParams) => {
    const { validations, plugins, value, context } = params;
    for (let i = 0; i < validations.length; i++) {
        const validator = validations[i];
        const validatorPlugin = plugins.find(plugin => plugin.validator.name === validator.name);

        if (!validatorPlugin || typeof validatorPlugin.validator.validate !== "function") {
            continue;
        }

        let valid = false;
        try {
            valid = await validatorPlugin.validator.validate({ value, validator, context });
        } catch (e) {
            valid = false;
        }

        if (!valid) {
            throw new Error(getI18NValue(validator.message) || "Invalid value.");
        }
    }
};

export const createValidation = (field: CmsContentModelField, context: CmsContext) => {
    const plugins = context.plugins.byType<CmsModelFieldValidatorPlugin>(
        "cms-model-field-validator"
    );

    return async value => {
        if (field.multipleValues) {
            await runValidations({
                validations: field.multipleValuesValidation,
                value,
                plugins,
                context
            });
            // Run field validation for each value item in case of `multipleValues = true`
            for (let index = 0; index < value.length; index++) {
                const currentValue = value[index];
                await runValidations({
                    validations: field.validation,
                    value: currentValue,
                    plugins,
                    context
                });
            }

            return true;
        } else {
            await runValidations({ validations: field.validation, value, plugins, context });
            return true;
        }
    };
};
