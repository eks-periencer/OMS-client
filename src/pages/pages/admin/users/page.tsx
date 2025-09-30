"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/components/ui/card"
import { Button } from "../../../../components/components/ui/button"
import { Badge } from "../../../../components/components/ui/badge"
import { Input } from "../../../../components/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/components/ui/dialog"
import { Label } from "../../../../components/components/ui/label"
import { Switch } from "../../../../components/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/components/ui/dropdown-menu"
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, Key, UserCheck, UserX, Loader2 } from "lucide-react"
import { Sidebar } from "../../../../components/components/layout/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { 
  fetchUsers, 
  fetchUserStats, 
  createUser, 
  updateUser, 
  deactivateUser, 
  reactivateUser, 
  deleteUser,
  resetUserPassword,
  setSelectedUser,
  clearSelectedUser,
  type User as ReduxUser,
  type CreateUserData,
  type UpdateUserData
} from "../../../../toolkit/userManagementSlice"
import { toast } from "sonner"
import type { AppDispatch, RootState } from "../../../../toolkit/store"
import { 
  DeleteConfirmationModal, 
  ResetPasswordConfirmationModal 
} from "../../../../components/components/ui/confirmation-modal"
import { LoadingOverlay } from "../../../../components/components/ui/loading-overlay"
import { useLoading } from "../../../../../hooks/use-loading"

const availableRoles = [
  { id: "1", name: "System Administrator", permissions: ["*"] },
  { id: "2", name: "Operations Manager", permissions: ["orders:*", "escalations:*", "customers:read"] },
  { id: "3", name: "Sales Representative", permissions: ["orders:create", "orders:read", "customers:*"] },
  { id: "4", name: "Application Administrator", permissions: ["app_admin:*", "orders:read", "fno:submit_manual"] },
  { id: "5", name: "Customer Success Manager", permissions: ["onboarding:*", "customers:read", "orders:read"] },
]

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { users, stats, loading, error, selectedUser } = useSelector((state: RootState) => state.userManagement)
  const { isAuthenticated } = useSelector((state: RootState) => state.authentication)
  const { withLoading, isLoading } = useLoading()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<ReduxUser | null>(null)
  const [userToResetPassword, setUserToResetPassword] = useState<ReduxUser | null>(null)

  // Load users and stats on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUsers())
      dispatch(fetchUserStats())
    }
  }, [dispatch, isAuthenticated])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated])

  // Show error toasts
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Debug logging
  // useEffect(() => {
  //   console.log('🔍 User Management Debug Info:')
  //   console.log('- isAuthenticated:', isAuthenticated)
  //   console.log('- users count:', users.length)
  //   console.log('- stats:', stats)
  //   console.log('- loading:', loading)
  //   console.log('- error:', error)
  // }, [isAuthenticated, users, stats, loading, error])

  // Filter users
  const filteredUsers = users.filter((user: ReduxUser) => {
    // Debug logging to identify the issue
    if (!user.firstName || !user.lastName || !user.email) {
      console.warn('User with missing data:', user)
    }

    const matchesSearch =
      (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role?.name === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = async (userData: CreateUserData) => {
    await withLoading('createUser', async () => {
      try {
        await dispatch(createUser(userData)).unwrap()
        toast.success("User created successfully")
        setIsCreateDialogOpen(false)
        // Refresh users list
        dispatch(fetchUsers())
        dispatch(fetchUserStats())
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create user"
        toast.error(errorMessage)
      }
    })
  }

  const handleUpdateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      await dispatch(updateUser({ id: userId, data: userData })).unwrap()
      toast.success("User updated successfully")
      setIsEditDialogOpen(false)
      dispatch(clearSelectedUser())
      // Refresh users list
      dispatch(fetchUsers())
      dispatch(fetchUserStats())
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user"
      toast.error(errorMessage)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await dispatch(deactivateUser(userId)).unwrap()
        toast.success("User deactivated successfully")
      } else {
        await dispatch(reactivateUser(userId)).unwrap()
        toast.success("User activated successfully")
      }
      // Refresh users list
      dispatch(fetchUsers())
      dispatch(fetchUserStats())
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user status"
      toast.error(errorMessage)
    }
  }

  const handleDeleteUser = (user: ReduxUser) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return
    
    await withLoading('deleteUser', async () => {
      try {
        await dispatch(deleteUser(userToDelete.id)).unwrap()
        toast.success("User deleted successfully")
        // Refresh users list
        dispatch(fetchUsers())
        dispatch(fetchUserStats())
        setIsDeleteModalOpen(false)
        setUserToDelete(null)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete user"
        toast.error(errorMessage)
      }
    })
  }

  const handleResetPassword = (user: ReduxUser) => {
    setUserToResetPassword(user)
    setIsResetPasswordModalOpen(true)
  }

  const confirmResetPassword = async () => {
    if (!userToResetPassword) return
    
    await withLoading('resetPassword', async () => {
      try {
        const result = await dispatch(resetUserPassword(userToResetPassword.id)).unwrap()
        toast.success("Password reset email sent successfully")
        console.log("Reset token:", result.resetToken) // For debugging
        setIsResetPasswordModalOpen(false)
        setUserToResetPassword(null)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to reset password"
        toast.error(errorMessage)
      }
    })
  }

  const handleEditUser = (user: ReduxUser) => {
    dispatch(setSelectedUser(user))
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 container mx-auto min-w-0">
          <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <CreateUserDialog onSubmit={handleCreateUser} onCancel={() => setIsCreateDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.total || users.length)}
            </div>
            <p className="text-xs text-muted-foreground">All system users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.active || users.filter((u: ReduxUser) => u.isActive).length)}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (stats?.inactive || users.filter((u: ReduxUser) => !u.isActive).length)}
            </div>
            <p className="text-xs text-muted-foreground">Deactivated accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Key className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : users.filter((u: ReduxUser) => u.role.name.includes("Admin")).length}
            </div>
            <p className="text-xs text-muted-foreground">Admin-level access</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and their access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: ReduxUser) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "secondary"}
                        className={user.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                            disabled={loading}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            disabled={loading}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleResetPassword(user)}
                            disabled={loading}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)} 
                            className="text-red-600"
                            disabled={loading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            dispatch(clearSelectedUser())
          }
        }}>
          <EditUserDialog
            user={selectedUser}
            onSubmit={(userData) => handleUpdateUser(selectedUser.id, userData)}
            onCancel={() => {
              setIsEditDialogOpen(false)
              dispatch(clearSelectedUser())
            }}
          />
        </Dialog>
      )}
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={confirmDeleteUser}
        itemName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : 'user'}
        loading={loading}
      />

      <ResetPasswordConfirmationModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false)
          setUserToResetPassword(null)
        }}
        onConfirm={confirmResetPassword}
        userName={userToResetPassword ? `${userToResetPassword.firstName} ${userToResetPassword.lastName}` : 'user'}
        loading={isLoading('resetPassword')}
      />

      {/* Global Loading Overlay */}
      <LoadingOverlay 
        isLoading={isLoading('createUser') || isLoading('deleteUser') || isLoading('resetPassword')} 
        message="Processing your request..."
      />
    </div>
  )
}

function CreateUserDialog({ onSubmit, onCancel }: { onSubmit: (data: CreateUserData) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role_name: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ firstName: "", lastName: "", email: "", phone: "", role_name: "" })
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>Add a new user to the system with appropriate role and permissions.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role_name}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role_name: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.role_name}
          >
            Create User
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function EditUserDialog({
  user,
  onSubmit,
  onCancel,
}: { user: ReduxUser; onSubmit: (data: UpdateUserData) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",  
    role_name: user.role.name,
    isActive: user.isActive,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>Update user information and permissions.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role_name}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role_name: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Update User</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

