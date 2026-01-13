import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { getTables, createTable, updateTable, deleteTable } from "@/services/dataService";
import { StatusBadge } from "@/components/ui/status-badge";

interface Table {
    id: number;
    number: number | string;
    status: 'available' | 'occupied' | 'payment-pending';
    capacity: number;
}

export default function AdminTables() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editTable, setEditTable] = useState<Table | null>(null);
    const [formData, setFormData] = useState({
        number: "",
        capacity: 4,
        status: "available" as Table['status']
    });

    const fetchTables = async () => {
        try {
            const data = await getTables();
            setTables(data);
        } catch (error) {
            toast.error("Failed to fetch tables");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (editTable) {
            setFormData({
                number: String(editTable.number),
                capacity: editTable.capacity,
                status: editTable.status
            });
        } else {
            setFormData({
                number: "",
                capacity: 4,
                status: "available"
            });
        }
    }, [editTable, isDialogOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editTable) {
                const updated = await updateTable(editTable.id, formData);
                setTables(prev => prev.map(t => t.id === editTable.id ? updated : t));
                toast.success("Table updated");
            } else {
                const created = await createTable(formData);
                setTables(prev => [...prev, created]);
                toast.success("Table added");
            }
            setIsDialogOpen(false);
            setEditTable(null);
        } catch (error) {
            toast.error("Failed to save table");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this table?")) return;
        try {
            await deleteTable(id);
            setTables(prev => prev.filter(t => t.id !== id));
            toast.success("Table deleted");
        } catch (error) {
            toast.error("Failed to delete table");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
                    <p className="text-muted-foreground">Manage restaurant tables and capacity</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Table
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editTable ? 'Edit Table' : 'Add New Table'}</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={handleSave}>
                            <div>
                                <Label htmlFor="number">Table Number</Label>
                                <Input
                                    id="number"
                                    type="number"
                                    placeholder="e.g. 1"
                                    value={formData.number}
                                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="capacity">Capacity (Seats)</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    placeholder="4"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Initial Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val: Table['status']) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="occupied">Occupied</SelectItem>
                                        <SelectItem value="payment-pending">Payment Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                        setEditTable(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    {editTable ? 'Update' : 'Add'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="card-elevated overflow-hidden bg-white">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Loading tables...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b">
                                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Table Number</th>
                                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Capacity</th>
                                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Current Status</th>
                                    <th className="px-6 py-4 text-center font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tables.sort((a, b) => Number(a.number) - Number(b.number)).map((table) => (
                                    <tr key={table.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {table.number}
                                                </div>
                                                <span className="font-medium text-slate-700">Table {table.number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Users className="h-4 w-4" />
                                                <span>{table.capacity} seats</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={table.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditTable(table);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(table.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && tables.length === 0 && (
                    <div className="py-20 text-center text-muted-foreground">
                        No tables configured. Click "Add Table" to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
