import React from "react";
import { CmsEditorFieldRendererPlugin } from "@webiny/app-headless-cms/types";
import { i18n } from "@webiny/app/i18n";
import ContentEntriesAutocomplete from "./components/ContentEntriesAutocomplete";
const t = i18n.ns("app-headless-cms/admin/fields/ref");

const plugin: CmsEditorFieldRendererPlugin = {
    type: "cms-editor-field-renderer",
    name: "cms-editor-field-renderer-ref",
    renderer: {
        rendererName: "ref-input",
        name: t`Reference Input`,
        description: t`Renders a simple input with its type set to "text".`,
        canUse({ field }) {
            return field.type === "ref" && !field.multipleValues;
        },
        render(props) {
            const Bind = props.getBind();
            return <Bind>{bind => <ContentEntriesAutocomplete {...props} bind={bind} />}</Bind>;
        }
    }
};

export default plugin;
