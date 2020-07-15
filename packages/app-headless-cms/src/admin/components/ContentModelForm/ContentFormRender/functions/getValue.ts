import get from "lodash/get";

const getValue = ({ bind, locale, field, index }) => {
    // I needed to do this because now we have index in the key name
    let values;
    const arrayIndex = index >= 0 ? index : 0;
    if (Array.isArray(bind.value) && bind.value[arrayIndex]) {
        values = bind.value[arrayIndex].values;
    } else {
        values = get(bind, "value.values");
    }

    // Previously, it used ti be just this
    // let values = get(bind, "value.values");

    if (!Array.isArray(values)) {
        values = [];
    }

    let valueForLocale = values.find(item => item.locale === locale);
    if (valueForLocale) {
        valueForLocale = valueForLocale.value;
    }

    if (field.multipleValues) {
        if (!Array.isArray(valueForLocale)) {
            valueForLocale = [];
        }

        if (index >= 0) {
            return valueForLocale[index] || null;
        }

        return valueForLocale;
    }

    return valueForLocale || null;
};

export default getValue;
