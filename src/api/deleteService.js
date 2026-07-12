import { deleteCategory } from "./menu/category.api";
import { deleteMenu } from "./menu/item.api";
import { deleteIngredient } from "./menu/ingredient.api";

const deleteMap = {
    category: (id) => deleteCategory(id),
    item: (id) => deleteMenu(id),
    ingredient: (id) => deleteIngredient(id),
};

export const deleteData = async (type, id) => {
    const action = deleteMap[type];

    if (!action) {
        throw new Error(`Unknown type: ${type}`);
    }

    return await action(id);
};