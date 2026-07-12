import { Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteData } from "../../api/deleteService";

export default function DeleteConfirmDialog({
    isOpen,
    onClose,
    typeOfTable,
    id,
    name,
    onDeleted,
}) {
    const [loading, setLoading] = useState(false);

    // close on ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleDelete = async () => {
        try {
            setLoading(true);

            await deleteData(typeOfTable, id);

            onDeleted?.();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Delete failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose} // click outside closes
        >
            <div
                className="bg-white rounded-lg shadow-lg w-[420px] p-6"
                onClick={(e) => e.stopPropagation()} // prevent inside click closing
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 rounded-full p-4">
                        <Trash2 className="text-red-500" size={30} />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-center">
                    Delete {typeOfTable}
                </h2>

                <p className="text-gray-500 text-center mt-3">
                    Are you sure you want to delete
                    {name && (
                        <>
                            <br />
                            <span className="font-semibold text-black">
                                "{name}"
                            </span>
                        </>
                    )}
                    ?
                </p>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        {loading && (
                            <Loader2 className="animate-spin" size={18} />
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}