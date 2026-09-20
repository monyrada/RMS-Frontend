import { useEffect, useState } from "react";
import { MapPin, Users, QrCode, Download, Loader2 } from "lucide-react";
import Modal from "../../../../modal/Modal.jsx";
import { getTableQrCode } from "../../../../api/table/table.api";
import { tableStatusConfig } from "../tableStatus.js";

export default function TableDetailModal({
    open,
    onClose,
    table,
    onEdit,
}) {
    const [qrUrl, setQrUrl] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);

    useEffect(() => {
        if (!open || !table?.id) return;

        let objectUrl;
        setQrLoading(true);
        setQrUrl(null);

        getTableQrCode(table.id)
            .then((res) => {
                objectUrl = URL.createObjectURL(res.data);
                setQrUrl(objectUrl);
            })
            .catch(() => setQrUrl(null))
            .finally(() => setQrLoading(false));

        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [open, table?.id]);

    if (!table) return null;
    const cfg = tableStatusConfig(table.status);

    const handleDownload = () => {
        if (!qrUrl) return;
        const a = document.createElement("a");
        a.href = qrUrl;
        a.download = `table-${table.tableNumber}-qr.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <Modal open={open} onClose={onClose} title="Table details" size="sm">
            <div className="px-6 py-5 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 border-2 flex items-center justify-center ${cfg.bg} ${cfg.border}`}>
                        <span className={`font-black text-sm ${cfg.text}`}>{table.tableNumber}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{table.tableNumber}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                            <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                            {!table.isActive && (
                                <span className="badge bg-gray-100 text-gray-500">Deactivated</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info rows */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5">
                        <Users size={13} className="text-gray-400" /> {table.capacity} seats
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2.5 min-w-0">
                        <MapPin size={13} className="text-gray-400 shrink-0" />
                        <span className="truncate">{table.location}</span>
                    </div>
                </div>

                {table.currentGuestName && (
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Current guest</p>
                        <p className="text-sm text-gray-700">{table.currentGuestName}</p>
                    </div>
                )}

                {/* QR code */}
                <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <QrCode size={12} /> QR ordering code
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-24 h-24 rounded-lg border border-gray-100 flex items-center justify-center bg-white shrink-0 overflow-hidden">
                            {qrLoading ? (
                                <Loader2 size={18} className="animate-spin text-gray-300" />
                            ) : qrUrl ? (
                                <img src={qrUrl} alt={`QR code for ${table.tableNumber}`} className="w-full h-full object-contain" />
                            ) : (
                                <QrCode size={20} className="text-gray-200" />
                            )}
                        </div>
                        <button
                            onClick={handleDownload}
                            disabled={!qrUrl}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <Download size={13} /> Download
                        </button>
                    </div>
                </div>
            </div>

            {onEdit && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                    <button
                        onClick={() => { onClose(); onEdit(table); }}
                        className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                        style={{ backgroundColor: "#1a4731" }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                    >
                        Edit table
                    </button>
                </div>
            )}
        </Modal>
    );
}
