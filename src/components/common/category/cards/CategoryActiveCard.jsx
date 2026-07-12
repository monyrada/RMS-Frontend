import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import UseToggleModal from "../../../shared/toggle-modal";
import CategoryFormModal from "../modals/CategoryFormModal";
import ConfirmDialog from "../../../ui/ConfirmDialog";

const toggleChange = (status) => {};

export default function CategoryActiveCard({ category, onToggle }) {
  if (!category) return null;

  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [titleForm, setTitleForm] = useState("create");
  const [categories, setCategories] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { handleOpen, handleClose } = UseToggleModal(
    setOpen,
    setSelectedItem,
    setTitleForm,
  );
  const handleDeleteConfirm = async () => {
      if (!deleteTarget) return;
      setDeleteLoading(true);
      try {
        await deleteMenu(deleteTarget.id);
        toast.success("Item deleted", `"${deleteTarget.name}" was removed.`);
        // Reload instead of mutating local state — keeps total count accurate
        await loadMenus();
      } catch {
        toast.error("Delete failed", "Could not delete the item. Please try again.");
      } finally {
        setDeleteLoading(false);
        setDeleteTarget(null);
      }
    };
  const FormActionModal = (type) => {
    console.log(type);
    if (type === "Edit") {
      setOpen(true);
    } else if (type === "Delete") {
      console.log(type);
      setOpenDelete(true);
      
    }
  };

  return (
    <div
      key={category.id}
      className="card flex items-center justify-between p-4 sm:p-5"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-forest-900 flex items-center justify-center text-2xl shrink-0">
          {category.icon}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-forest-900 truncate">
            {category.name}
          </p>
          <p className="text-xs text-gray-400">{category.itemCount} items</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2 ">
        <button
          className={`relative w-10 h-5 rounded-full transition-colors ${category.status ? "bg-forest-600" : "bg-gray-200"}`}
        >
          <span
            className={`absolute bottom-0 top-0.5 left-0.5 w-4 h-4 mr-10 bg-white rounded-full shadow transition-transform ${category.status ? "translate-x-5" : "translate-x-0"}`}
          ></span>
        </button>
        <button
          onClick={() => FormActionModal("Edit")}
          className="p-1.5 rounded-lg hover:bg-cream-100 text-gray-400 hover:text-forest-700 transition-colors"
        >
          <Edit2 size={13} />
        </button>
        <button
          onClick={() => FormActionModal("Delete")}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {/* modal */}
      <CategoryFormModal
        open={open}
        onClose={handleClose}
        onSubmit="null"
        categories="null"
        mode="edit"
      />

      <ConfirmDialog
        open={openDelete}
        onClose={true}
        onConfirm={handleDeleteConfirm}
        loading="true"
        variant="danger"
        title="Delete item?"
        description={`" will be permanently removed from the menu. This cannot be undone.`}
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
      />
    </div>
  );
}
