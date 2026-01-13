import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, User as UserIcon, Shield, ChefHat, UtensilsCrossed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/dataService";

interface UserType {
  id: string | number;
  username: string;
  role: 'waiter' | 'kitchen' | 'supervisor' | 'admin';
  password?: string;
}

const roleIcons = {
  waiter: UtensilsCrossed,
  kitchen: ChefHat,
  supervisor: Shield,
  admin: Shield,
};

const roleColors = {
  waiter: 'bg-info/10 text-info',
  kitchen: 'bg-warning/10 text-warning',
  supervisor: 'bg-success/10 text-success',
  admin: 'bg-primary/10 text-primary',
};

export default function AdminUsers() {
  const [userList, setUserList] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    role: "waiter" as UserType['role'],
    password: ""
  });

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUserList(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (editUser) {
      setFormData({
        username: editUser.username,
        role: editUser.role,
        password: ""
      });
    } else {
      setFormData({
        username: "",
        role: "waiter",
        password: ""
      });
    }
  }, [editUser, isDialogOpen]);

  const filteredUsers = userList.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (userId: string | number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId);
      setUserList(prev => prev.filter(user => user.id !== userId));
      toast.success("User deleted");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editUser) {
        const updated = await updateUser(editUser.id, formData);
        setUserList(prev => prev.map(u => u.id === editUser.id ? updated : u));
        toast.success("User updated");
      } else {
        const created = await createUser(formData);
        setUserList(prev => [...prev, created]);
        toast.success("User added");
      }
      setIsDialogOpen(false);
      setEditUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.username?.[0] || "Failed to save user");
    }
  };

  const countByRole = (role: string) => userList.filter(u => u.role === role).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage staff accounts and access</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <Label htmlFor="username">Username / Name</Label>
                <Input
                  id="username"
                  placeholder="Enter name"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val: UserType['role']) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pin">PIN / Password</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder={editUser ? "Leave blank to keep current" : "Enter PIN or Password"}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!editUser}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  {editUser ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['waiter', 'kitchen', 'supervisor', 'admin'] as const).map(role => {
          const Icon = roleIcons[role];
          return (
            <div key={role} className="card-elevated p-4 flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${roleColors[role]}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{countByRole(role)}</p>
                <p className="text-sm text-muted-foreground capitalize">{role}s</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="card-elevated p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 border border-slate-200 bg-white"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-elevated overflow-hidden border-none shadow-sm bg-white">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Loading staff members...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">Staff Member</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-400">Access Method</th>
                  <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const Icon = roleIcons[user.role];
                  const isWaiter = user.role === 'waiter';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${roleColors[user.role]} shadow-sm`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="font-bold text-slate-700">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                          roleColors[user.role]
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isWaiter ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black uppercase">PIN</span>
                            <span className="font-mono tracking-widest text-xs">••••</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">User/Pass</span>
                            <span className="font-mono text-xs opacity-50 italic">Encrypted</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-slate-200"
                            onClick={() => {
                              setEditUser(user);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 text-destructive"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <UserIcon className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <h3 className="text-slate-400 font-medium">No staff members found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
