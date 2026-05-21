const normalizeName = (value = '') =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const KEYWORD_IMAGE_RULES = [];

export const getMappedProductImage = (name, image) => {
    const normalized = normalizeName(name);
    if (!normalized) return image;

    const matchedRule = KEYWORD_IMAGE_RULES.find((rule) =>
        rule.keywords.every((keyword) => normalized.includes(keyword))
    );

    return matchedRule ? matchedRule.image : image;
};
