import { TYPE_GROUPING } from "../constants/typeGrouping";

export const slugifyVi = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

export const buildCatalogPath = (groupKey, itemTitle, subLabel) =>
  `/products/${slugifyVi(groupKey)}/${slugifyVi(itemTitle)}/${slugifyVi(subLabel)}`;

export const findCatalogNodeBySlugs = (speciesSlug, typeSlug, subSlug) => {
  const group = TYPE_GROUPING.find((g) => slugifyVi(g.key) === slugifyVi(speciesSlug));
  if (!group) return null;
  const item = group.items.find((i) => slugifyVi(i.title) === slugifyVi(typeSlug));
  if (!item) return null;
  const subItem = item.subItems.find((s) => slugifyVi(s.label) === slugifyVi(subSlug));
  if (!subItem) return null;
  return { group, item, subItem };
};
