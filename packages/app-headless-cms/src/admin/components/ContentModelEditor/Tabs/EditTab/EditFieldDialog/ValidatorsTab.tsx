import React, { useMemo, Fragment } from "react";
import { getPlugins } from "@webiny/plugins";
import { useI18N } from "@webiny/app-i18n/hooks/useI18N";
import {
    CmsEditorFieldTypePlugin,
    CmsEditorFieldValidatorPlugin
} from "@webiny/app-headless-cms/types";
import { renderValidatorForms } from "./ValidatorsTab/functions/renderValidatorForms";

const getValidators = (validators: string[] = []) => {
    if (validators.length === 0) {
        return [];
    }

    return getPlugins<CmsEditorFieldValidatorPlugin>("cms-editor-field-validator")
        .map(plugin => plugin.validator)
        .map(validator => {
            if (validators.includes(validator.name)) {
                return { optional: true, validator };
            } else if (validators.includes(`!${validator.name}`)) {
                return { optional: false, validator };
            }
            return null;
        })
        .filter(Boolean)
        .sort((a, b) => {
            if (!a.optional && b.optional) {
                return -1;
            }

            if (a.optional && !b.optional) {
                return 1;
            }

            return 0;
        });
};

type ValidatorsTabPropsType = {
    form: any;
    fieldPlugin: CmsEditorFieldTypePlugin;
    multipleValuesValidators?: boolean;
};

const ValidatorsTab = (props: ValidatorsTabPropsType) => {
    const i18n = useI18N();
    const {
        form: { Bind },
        fieldPlugin,
        multipleValuesValidators
    } = props;

    const key = multipleValuesValidators ? "multipleValuesValidators" : "validators";
    const name = multipleValuesValidators ? "multipleValuesValidation" : "validation";

    const validators = useMemo(() => {
        return getValidators(fieldPlugin.field[key]);
    }, [key]);

    return (
        <Fragment>
            <Bind name={name}>
                {({ value: validationValue, onChange: onChangeValidation }) =>
                    renderValidatorForms({
                        validationValue,
                        onChangeValidation,
                        validators,
                        i18n
                    })
                }
            </Bind>
        </Fragment>
    );
};

export default ValidatorsTab;
