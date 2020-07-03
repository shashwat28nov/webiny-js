import { CmsEditorFieldValidatorPlugin } from "@webiny/app-headless-cms/types";
import { validation } from "@webiny/validation";

export default {
    type: "cms-editor-field-validator",
    name: "cms-editor-field-validator-required",
    validator: {
        name: "required",
        label: "Required",
        description: "You won't be able to submit the form if this field is empty",
        defaultMessage: "Value is required.",
        validate: value => {
            return validation.validate(value, "required");
        }
    }
} as CmsEditorFieldValidatorPlugin;
