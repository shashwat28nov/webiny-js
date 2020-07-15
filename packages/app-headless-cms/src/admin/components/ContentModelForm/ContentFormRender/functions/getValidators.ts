import {
    CmsEditorFieldValidatorPlugin,
    CmsEditorFieldValidator
} from "@webiny/app-headless-cms/types";

type getValidatorsParams = {
    validatorPlugins: CmsEditorFieldValidatorPlugin[];
    validation: CmsEditorFieldValidator[];
    I18NGetValue: (value: any, locale?: string) => any;
    locale: string;
    valueExtractor: (value: any) => any;
};

export const getValidators = ({
    validatorPlugins,
    validation,
    I18NGetValue,
    locale,
    valueExtractor
}: getValidatorsParams) => {
    return validation
        .map(item => {
            const validatorPlugin = validatorPlugins.find(
                plugin => plugin.validator.name === item.name
            );

            if (!validatorPlugin || typeof validatorPlugin.validator.validate !== "function") {
                return;
            }

            return async value => {
                const realValue = valueExtractor(value);

                let isInvalid;
                try {
                    const result = await validatorPlugin.validator.validate(realValue, item);
                    isInvalid = result === false;
                } catch (e) {
                    isInvalid = true;
                }
                // If value for selected locale exist use that
                // otherwise get value for default locale
                const errorMessage =
                    I18NGetValue(item.message, locale) || I18NGetValue(item.message);

                if (isInvalid) {
                    throw new Error(errorMessage || "Invalid value.");
                }
            };
        })
        .filter(Boolean);
};

export const getValidationResult = async ({ value, validator }) => {
    let isValid = true;
    let message;
    try {
        await validator(value);
    } catch (error) {
        isValid = false;
        message = error.message;
    }
    return { isValid, message };
};
