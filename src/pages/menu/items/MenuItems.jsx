import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, SlidersHorizontal } from "lucide-react";

import Pagination from "../../../components/shared/pagination";
import ItemFormDrawer from "../../../components/common/items/ItemFormDrawer.jsx";
import ItemDetailModal from "../../../components/common/items/ItemDetailModal.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";
import { useToast } from "../../../components/ui/Toast.jsx";

// Integration API
import { getMenus, createMenu, updateMenu, deleteMenu } from "../../../api/menu/item.api";
import { getCategories } from "../../../api/menu/category.api";

const getStatusStyle = (status) =>
    status ? "bg-forest-300/20 text-forest-700" : "bg-red-100 text-red-600";

/*
   Item Image
*/
function ItemImage({ imageUrl, size = "sm" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-12 h-12";
  const text = size === "sm" ? "text-base" : "text-2xl";

  if (imageUrl) {
    return (
        <img
            src={imageUrl}
            alt="menu item"
            className={`${dim} rounded-xl object-cover shrink-0`}
        />
    );
  }

  return (
      <div className={`${dim} rounded-xl bg-forest-900 flex items-center justify-center ${text} shrink-0`}>🍽️</div>
  );
}

/*
   Mobile Card
*/
function ItemCard({ item, onView, onEdit, onDelete }) {
  return (
      <div className="card p-4 flex gap-3">
        <ItemImage imageUrl={item.imageUrl} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-forest-900 text-sm truncate">{item.name}</p>
            <span className={`badge ${getStatusStyle(item.status)}`}>
            {item.status ? "Available" : "Unavailable"}
          </span>
          </div>

          <p className="text-xs text-gray-400 mt-0.5">{item.categoryName}</p>
          <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>

          <div className="mt-2">
          <span className="text-sm font-bold text-forest-800">
            ${Number(item.price || 0).toFixed(2)}
          </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button
              onClick={() => onView(item)}
              className="p-1.5 rounded-lg hover:bg-cream-100"
              title="View details"
          >
            <Eye size={13} />
          </button>

          <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg hover:bg-cream-100"
              title="Edit"
          >
            <Edit2 size={13} />
          </button>

          <button
              onClick={() => onDelete(item)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
              title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
  );
}

/*
   Main Component
*/
export default function MenuItems() {
  const toast = useToast();

  const [items, setItems]               = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [view, setView]                 = useState("table");
  const [page, setPage]                 = useState(1);
  const [limit, setLimit]               = useState(10);
  const [categories, setCategories]     = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Drawer (create / edit)
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // View detail modal
  const [detailItem, setDetailItem]     = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleteLoading, setDeleteLoading] = useState(false);

  /*
     Load Menus
  */
  const loadMenus = async (currentPage = page, currentLimit = limit) => {
    try {
      setLoading(true);

      const response = await getMenus({
        offset: (currentPage - 1) * currentLimit,
        max: currentLimit,
        sort: "name",
        order: "asc",
      });

      setItems(response?.data?.data || []);
      setTotal(response?.data?.total || 0);
    } catch (error) {
      console.error("Load menu failed:", error);
      toast.error("Failed to load", "Could not load menu items.");
    } finally {
      setLoading(false);
    }
  };

  /*
     Load Categories
  */
  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response?.data?.data || []);
    } catch (error) {
      console.error("Load categories failed", error);
    }
  };

  useEffect(() => { loadMenus(page, limit); }, [page, limit]);
  useEffect(() => { loadCategories(); }, []);

  /*
     Drawer Actions
  */
  const handleAdd = () => {
    setSelectedItem(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
  };

  /*
     View Detail
  */
  const handleView = (item) => {
    setDetailItem(item);
  };

  /*
     Save Item
  */
  const handleSubmit = async (formData) => {
    try {
      if (selectedItem) {
        await updateMenu(selectedItem.id, formData);
        toast.success("Item updated", `"${formData.name}" was saved successfully.`);
      } else {
        await createMenu(formData);
        toast.success("Item added", `"${formData.name}" was added to the menu.`);
      }

      await loadMenus(page, limit);
      handleCloseDrawer();
    } catch (error) {
      console.error(error);
      toast.error("Save failed", "Please check your inputs and try again.");
    }
  };

  /*
     Delete — step 1: open confirm dialog
  */
  const handleDeleteRequest = (item) => {
    setDeleteTarget({ id: item.id, name: item.name });
  };

  /*
     Delete — step 2: confirmed
  */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMenu(deleteTarget.id);

      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);

      toast.success("Item deleted", `"${deleteTarget.name}" was removed.`);
    } catch (error) {
      console.error(error);
      toast.error("Delete failed", "Could not delete the item. Please try again.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /*
     Search
  */
  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return items.filter(
        (item) =>
            item.name?.toLowerCase().includes(keyword) ||
            item.nameKh?.toLowerCase().includes(keyword)
    );
  }, [items, search]);

  if (loading) {
    return <div className="card p-8 text-center">Loading menu items...</div>;
  }

  return (
      <>
        <div className="space-y-4 fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search item..."
                    className="pl-8 pr-3 py-2 rounded-xl bg-white border border-cream-200 text-sm outline-none focus:border-forest-400 w-full sm:w-60"
                />
              </div>

              <button
                  onClick={() => setView((v) => (v === "table" ? "cards" : "table"))}
                  className="p-2 rounded-xl bg-white border border-cream-200"
                  title="Toggle view"
              >
                <SlidersHorizontal size={15} />
              </button>

              <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
                <Plus size={14} />
                Add Item
              </button>
            </div>
          </div>

          {/* CARD VIEW */}
          {view === "cards" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filtered.map((item) => (
                      <ItemCard
                          key={item.id}
                          item={item}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDeleteRequest}
                      />
                  ))}
                </div>

                <Pagination
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                />
              </>
          ) : (
              /* TABLE VIEW */
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-cream-200">
                    <tr>
                      <th className="table-th w-10"></th>
                      <th className="table-th">Name</th>
                      <th className="table-th">Category</th>
                      <th className="table-th">Description</th>
                      <th className="table-th text-right">Price</th>
                      <th className="table-th">Status</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filtered.map((item) => (
                        <tr key={item.id} className="hover:bg-cream-50">
                          <td className="table-td">
                            <ItemImage imageUrl={item.imageUrl} size="sm" />
                          </td>

                          <td className="table-td font-medium">{item.name}</td>

                          <td className="table-td">{item.categoryName}</td>

                          <td className="table-td max-w-[250px] truncate">
                            {item.description}
                          </td>

                          <td className="table-td text-right font-semibold">
                            ${Number(item.price || 0).toFixed(2)}
                          </td>

                          <td className="table-td">
                        <span className={`badge ${getStatusStyle(item.status)}`}>
                          {item.status ? "Available" : "Unavailable"}
                        </span>
                          </td>

                          <td className="table-td">
                            <div className="flex justify-end gap-2">
                              {/* View */}
                              <button
                                  onClick={() => handleView(item)}
                                  className="p-1.5 rounded-lg hover:bg-cream-100"
                                  title="View details"
                              >
                                <Eye size={13} />
                              </button>

                              {/* Edit */}
                              <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 rounded-lg hover:bg-cream-100"
                                  title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                  onClick={() => handleDeleteRequest(item)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                  title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      No menu items found.
                    </div>
                )}

                <div className="border-t border-cream-200 px-4">
                  <Pagination
                      total={total}
                      page={page}
                      limit={limit}
                      onPageChange={setPage}
                      onLimitChange={setLimit}
                  />
                </div>
              </div>
          )}
        </div>

        {/* ── Create / Edit Drawer ── */}
        <ItemFormDrawer
            open={drawerOpen}
            onClose={handleCloseDrawer}
            onSubmit={handleSubmit}
            item={selectedItem}
            categories={categories}
        />

        {/* ── View Detail Modal ── */}
        <ItemDetailModal
            open={!!detailItem}
            onClose={() => setDetailItem(null)}
            item={detailItem}
            onEdit={(item) => {
              setDetailItem(null);
              handleEdit(item);
            }}
        />

        {/* ── Delete Confirm Dialog ── */}
        <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
            variant="danger"
            title="Delete item?"
            description={`"${deleteTarget?.name}" will be permanently removed from the menu. This cannot be undone.`}
            confirmLabel="Yes, delete"
            cancelLabel="Keep it"
        />
      </>
  );
}
