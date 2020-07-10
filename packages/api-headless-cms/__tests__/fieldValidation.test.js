import mdbid from "mdbid";
import useContentHandler from "./utils/useContentHandler";
import mocks from "./mocks/fields/fieldValidation";

describe("Fields validation", () => {
    const { database, environment } = useContentHandler();
    const ids = { environment: mdbid(), contentModelGroup: mdbid() };

    beforeAll(async () => {
        // Let's create a basic environment and a content model group.
        await database.collection("CmsEnvironment").insert({
            id: ids.environment,
            name: "Initial Environment",
            description: "This is the initial environment.",
            createdFrom: null
        });

        await database.collection("CmsContentModelGroup").insert({
            id: ids.contentModelGroup,
            name: "Ungrouped",
            slug: "ungrouped",
            description: "A generic content model group",
            icon: "fas/star",
            environment: ids.environment
        });
    });

    it("must run field validations", async () => {
        const { content, createContentModel } = environment(ids.environment);

        // 1. Create a content model with a `fieldValidation` for "title" and "description" field.
        await createContentModel(
            mocks.withTitleAndDescriptionFieldValidation({
                contentModelGroupId: ids.contentModelGroup
            })
        );

        const products = await content("product");

        // 2. Let's create a new product entry without `title`. An error should be thrown because of field validation.
        let error;
        try {
            await products.create({
                data: mocks.createProductWithoutTitle
            });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`Validation failed.`);
        expect(mocks.getValidationMessage({ error, fieldId: "title" })).toBe(`Value is required!!`);

        // 3. Let's create a new product entry with a`long title`.
        // An error should be thrown because of field validation.
        error = null;
        try {
            await products.create({
                data: mocks.createProductWithLongTitle
            });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`Validation failed.`);
        expect(mocks.getValidationMessage({ error, fieldId: "title" })).toBe(`Value is too long.`);

        // 4. Let's create a new product entry with a `short title` and `no description`.
        // An error should be thrown because of field validation.
        error = null;
        try {
            await products.create({
                data: mocks.createProductWithShortTitleAndNoDescription
            });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`Validation failed.`);
        expect(mocks.getValidationMessage({ error, fieldId: "title" })).toBe(`Value is too short.`);
        expect(mocks.getValidationMessage({ error, fieldId: "description" })).toBe(
            `Value is required!!`
        );

        // 5. Let's create a new product entry whose `title` and `description` are empty in other locale.
        // An error should be thrown because of field validation.
        error = null;
        try {
            await products.create({
                data: mocks.createProductWithoutTitleAndDescriptionInOtherLocale
            });
        } catch (e) {
            error = e;
        }
        // TODO: maybe check for validation message is other locale too.
        expect(error.message).toBe(`Validation failed.`);
        expect(mocks.getValidationMessage({ error, fieldId: "title" })).toBe(`Value is required!!`);
        expect(mocks.getValidationMessage({ error, fieldId: "description" })).toBe(
            `Value is required!!`
        );
    });

    it("must run multiple values field validations", async () => {
        const { content, createContentModel } = environment(ids.environment);

        // 1. Create a content model with a "title", "description" and "tags" field.
        // Where `tags` will have `multipleValues` and `multipleValuesValidation`
        await createContentModel(
            mocks.withMultipleValuesFieldValidation({
                contentModelGroupId: ids.contentModelGroup
            })
        );

        const products = await content("digitalProduct");

        // 2. Let's create a new product entry without `tags`. An error should be thrown because of field validation.
        let error;
        try {
            await products.create({
                data: mocks.createDigitalProductWithNoTags
            });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`Validation failed.`);
        expect(mocks.getValidationMessage({ error, fieldId: "tags" })).toBe(
            `List cannot be empty.`
        );

        // 3. Let's create a new product entry with only one `tag` in list.
        // An error should be thrown because of field validation.
        error = null;
        try {
            await products.create({
                data: mocks.createDigitalProductWithOneTag
            });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`Validation failed.`);
        expect(mocks.getValidationMessage({ error, fieldId: "tags" })).toBe(`List is too short.`);

        // 4. Let's create a new product entry with an empty `tag` in list.
        // An error should be thrown because of field validation.
        error = null;
        try {
            await products.create({
                data: mocks.createDigitalProductWithTags
            });
        } catch (e) {
            error = e;
        }

        expect(error.message).toBe(`Validation failed.`);
        expect(mocks.getValidationMessage({ error, fieldId: "tags" })).toBe(`Value is required.`);
    });
});
