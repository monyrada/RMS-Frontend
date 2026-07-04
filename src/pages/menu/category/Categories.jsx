import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import CategoryCard from "../../../components/common/category/cards/CategoryActiveCard.jsx";
import CategoryFormModal from "../../../components/common/category/modals/CategoryFormModal.jsx";

import UseToggleModal from "../../../components/shared/toggle-modal.jsx";
import {
  getCategories,
  createCategory,
  updateCategory,
} from "../../../api/menu/category.api.js";

import { useToast } from "../../../components/ui/Toast.jsx";

export default function Categories() {
  const toast = useToast();

  // state
  const [open, setOpen] = useState(false);
  const [titleForm, setTitleForm] = useState("create");
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // modal handlers
  const {
    handleOpen,
    handleClose,
  } = UseToggleModal(setOpen, setSelectedItem, setTitleForm);

  // load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getCategories();
      setCategories(res?.data?.data || []);
    } catch {
      toast.error("Failed to load", "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // initial load
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // submit create / update
  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await updateCategory(selectedItem.id, formData);

        toast.success(
          "Category updated",
          `"${formData.name}" was saved successfully.`
        );
      } else {
        await createCategory(formData);

        toast.success(
          "Category added",
          `"${formData.name}" was added successfully.`
        );
      }

      handleClose();
      await loadCategories();
    } catch {
      toast.error("Save failed", "Please check your inputs and try again.");
    }
  };

  // toggle active
  const toggleActive = (id) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, active: !c.active } : c
      )
    );
  };

  return (
    <div className="space-y-4 fade-in">
      {/* header */}
      <div className="flex justify-end">
        <button
          onClick={handleOpen}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* content */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onToggle={toggleActive}
            />
          ))}
        </div>
      )}

      {/* modal */}
      <CategoryFormModal
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        categories={categories}
        mode={selectedItem ? "edit" : "create"}
      />
    </div>
  );
}