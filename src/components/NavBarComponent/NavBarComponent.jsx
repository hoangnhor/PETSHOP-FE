import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import * as TypeServices from "../../services/TypeServices";
import { WrapperContent, WrapperGroupTitle, WrapperLableText, WrapperPurposeChip, WrapperPurposeList, WrapperSectionBlock, WrapperSectionTitle, WrapperTextValue } from "./style";

const normalizeCategoryKey = (value = "", species = "") =>
    String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(species === "dog" ? /cho cho/g : /cho meo/g, "")
        .replace(/va/g, "&")
        .replace(/thuc pham dinh duong/g, "dinh duong")
        .replace(/do dung & do choi & phu kien/g, "do dung & phu kien")
        .replace(/chuong,\s*nha,\s*balo,\s*quay,\s*dem/g, "chuong nha van chuyen")
        .replace(/chuong,\s*chau,\s*balo va tui van chuyen/g, "chuong chau van chuyen")
        .replace(/thuoc va thuc pham chuc nang/g, "thuoc & thuc pham chuc nang")
        .replace(/[^\w&]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");

const NavBarComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const selectedType = searchParams.get("type") || "";
    const selectedKeyword = searchParams.get("keyword") || "";
    const [openKey, setOpenKey] = React.useState("");

    const typesQuery = useQuery({
        queryKey: ["types"],
        queryFn: TypeServices.getAllType,
    });
    const menuBySpecies = React.useMemo(() => {
        const all = typesQuery.data?.data || [];
        const roots = all.filter((type) => Number(type.level) === 1);
        const children = all.filter((type) => Number(type.level) === 2 && type.parentId);
        const grandchildren = all.filter((type) => Number(type.level) === 3 && type.parentId);
        const mapRootById = new Map(roots.map((root) => [String(root._id), root]));
        const mapChildrenByParent = new Map();
        grandchildren.forEach((item) => {
            const parentId = String(item.parentId);
            if (!mapChildrenByParent.has(parentId)) mapChildrenByParent.set(parentId, []);
            mapChildrenByParent.get(parentId).push(item);
        });
        const map = { dog: { title: "PHỤ KIỆN CỦA CHÓ", sections: [] }, cat: { title: "PHỤ KIỆN CỦA MÈO", sections: [] } };

        roots.forEach((root) => {
            const species = root.species === "cat" ? "cat" : root.species === "dog" ? "dog" : null;
            if (species) map[species].title = root.name || map[species].title;
        });

        children.forEach((type) => {
            const parent = mapRootById.get(String(type.parentId));
            const species = type.species || parent?.species;
            if (species !== "dog" && species !== "cat") return;
            map[species].sections.push(type);
        });

        const dedupeSections = (sections = [], species = "") => {
            const bucket = new Map();
            sections.forEach((section) => {
                const key = normalizeCategoryKey(section.name, species);
                const current = bucket.get(key);
                if (!current) {
                    bucket.set(key, section);
                    return;
                }
                const currentTime = new Date(current.updatedAt || current.createdAt || 0).getTime();
                const nextTime = new Date(section.updatedAt || section.createdAt || 0).getTime();
                if (nextTime >= currentTime) bucket.set(key, section);
            });
            return Array.from(bucket.values()).sort(
                (a, b) =>
                    Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
                    String(a.name || "").localeCompare(String(b.name || ""), "vi")
            );
        };

        map.dog.sections = dedupeSections(map.dog.sections, "dog");
        map.cat.sections = dedupeSections(map.cat.sections, "cat");
        map.dog.sections = map.dog.sections.map((section) => ({
            ...section,
            subTypes: (mapChildrenByParent.get(String(section._id)) || [])
                .sort((a, b) =>
                    Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
                    String(a.name || "").localeCompare(String(b.name || ""), "vi")
                ),
        }));
        map.cat.sections = map.cat.sections.map((section) => ({
            ...section,
            subTypes: (mapChildrenByParent.get(String(section._id)) || [])
                .sort((a, b) =>
                    Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
                    String(a.name || "").localeCompare(String(b.name || ""), "vi")
                ),
        }));
        return map;
    }, [typesQuery.data?.data]);

    return (
        <div>
            <WrapperLableText>Danh Mục Sản Phẩm</WrapperLableText>
            <WrapperContent>
                <WrapperTextValue
                    onClick={() => navigate("/products")}
                    $isSelected={!selectedType && !selectedKeyword}
                >
                    Tất cả sản phẩm
                </WrapperTextValue>
                {["dog", "cat"].map((speciesKey) => (
                    <div key={speciesKey}>
                        <WrapperGroupTitle>{menuBySpecies[speciesKey].title}</WrapperGroupTitle>
                        {menuBySpecies[speciesKey].sections.map((type) => {
                            const typeId = String(type._id);
                            return (
                                <WrapperSectionBlock key={type._id}>
                                    <WrapperSectionTitle
                                        type="button"
                                        $isActive={openKey === typeId || selectedType === typeId}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setOpenKey((prev) => (prev === typeId ? "" : typeId));
                                            navigate(`/products?type=${type._id}`);
                                        }}
                                    >
                                        {type.name}
                                    </WrapperSectionTitle>
                                    {(openKey === typeId || selectedType === typeId) && (
                                        <WrapperPurposeList>
                                            {(type.subTypes?.length ? type.subTypes : [{ _id: `${type._id}-all`, name: "Xem danh mục", _parentTypeId: type._id }]).map((subItem) => (
                                                <WrapperPurposeChip
                                                    key={subItem._id || `${typeId}-${subItem.name}`}
                                                    type="button"
                                                    $isSelected={selectedType === String(subItem._parentTypeId || subItem._id)}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        const nextTypeId = String(subItem._parentTypeId || subItem._id);
                                                        const nextUrl = `/products?type=${nextTypeId}`;
                                                        if (`${location.pathname}${location.search}` === nextUrl) return;
                                                        navigate(nextUrl);
                                                    }}
                                                >
                                                    {subItem.name}
                                                </WrapperPurposeChip>
                                            ))}
                                        </WrapperPurposeList>
                                    )}
                                </WrapperSectionBlock>
                            );
                        })}
                    </div>
                ))}
            </WrapperContent>
        </div>
    );
};

export default NavBarComponent;
