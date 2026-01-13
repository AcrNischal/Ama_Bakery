import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem
} from "@/services/dataService";

interface MenuItem {
  id: string | number;
  name: string;
  price: number | string;
  category: number | string;
  category_name?: string;
  available: boolean;
}

interface Category {
  id: string | number;
  name: string;
}

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const [itemFormData, setItemFormData] = useState({
    name: "",
    price: "",
    category: "",
    available: true
  });

  const fetchData = async () => {
    try {
      const [cats, menuItems] = await Promise.all([getCategories(), getMenuItems()]);
      setCategories(cats);
      setItems(menuItems);
    } catch (error) {
      toast.error("Failed to fetch menu data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editItem) {
      setItemFormData({
        name: editItem.name,
        price: String(editItem.price),
        category: String(editItem.category),
        available: editItem.available
      });
    } else {
      setItemFormData({
        name: "",
        price: "",
        category: categories.length > 0 ? String(categories[0].id) : "",
        available: true
      });
    }
  }, [editItem, isItemDialogOpen, categories]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || String(item.category) === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const updated = await updateMenuItem(item.id, { available: !item.available });
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      toast.success("Availability updated");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    // Explicitly cast data types for the backend
    const payload = {
      ...itemFormData,
      price: parseFloat(itemFormData.price),
      category: parseInt(itemFormData.category, 10),
    };

    if (isNaN(payload.price)) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!payload.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      if (editItem) {
        const updated = await updateMenuItem(editItem.id, payload);
        setItems(prev => prev.map(i => i.id === editItem.id ? updated : i));
        toast.success("Item updated");
      } else {
        const created = await createMenuItem(payload);
        setItems(prev => [...prev, created]);
        toast.success("Item added");
      }
      setIsItemDialogOpen(false);
      setEditItem(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.name?.[0] || "Failed to save item";
      toast.error(errorMessage);
    }
  };

  const handleDeleteItem = async (itemId: string | number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteMenuItem(itemId);
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success("Item deleted");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryInput.trim()) return;
    try {
      const created = await createCategory({ name: newCategoryInput.trim() });
      setCategories(prev => [...prev, created]);
      setNewCategoryInput("");
      toast.success("Category added");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string | number) => {
    if (!confirm("Are you sure? Items in this category might be affected.")) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p className="text-lg">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground">Manage your bakery items and categories</p>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <div className="flex items-center justify-between gap-4 mb-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSaveItem}>
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter item name"
                    value={itemFormData.name}
                    onChange={e => setItemFormData({ ...itemFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={itemFormData.price}
                    onChange={e => setItemFormData({ ...itemFormData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={itemFormData.category}
                    onValueChange={val => setItemFormData({ ...itemFormData, category: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="available">Available</Label>
                  <Switch
                    id="available"
                    checked={itemFormData.available}
                    onCheckedChange={val => setItemFormData({ ...itemFormData, available: val })}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsItemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editItem ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="items" className="space-y-4 mt-0">
          <div className="space-y-4">
            <div className="card-elevated p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
                className="whitespace-nowrap rounded-full"
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={categoryFilter === String(cat.id) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(String(cat.id))}
                  className="whitespace-nowrap rounded-full"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`card-elevated p-4 ${!item.available && 'opacity-60'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category_name}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">₹{item.price}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => handleToggleAvailability(item)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.available ? 'Available' : 'Out of stock'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditItem(item);
                        setIsItemDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="card-elevated py-12 text-center text-muted-foreground">
              No items found matching your criteria
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6 mt-6">
          <div className="card-elevated p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Enter new category name..."
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
              />
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                  <span className="font-medium">{category.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
