import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import api from "@/config/api";
import { useBranchStore } from "@/agentadmindomain/branches/stores"; // Add this import
import type {
  Account,
  BranchManagerAccount,
  BackOfficeAccount,
  AssignManager
} from "@/types";

export const useAccounts = defineStore("user-management", () => {
  const branchStore = useBranchStore(); // Initialize branch store
  const isLoading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  // State
  const backofficeAccounts: Ref<Account[]> = ref([]);
  const managerAccounts: Ref<BranchManagerAccount[]> = ref([]);

  // Back Office Accounts
  const addBackOfficeAccount = async (payload: BackOfficeAccount) => {
    isLoading.value = true;
    try {
      const { data } = await api.post("/agent-admin/create-back-office-account", payload);
      backofficeAccounts.value.push(data.data);
      return data.data;
    } catch (err) {
      error.value = "Failed to create back office account";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // allocate manager to a branch using managerId
  //  const allocateManager = (payload: AllocateManager) => {
  //   managerAllocations.value.push({
  //     id: managerAllocations.value.length + 1,
  //     dateAssigned: new Date().toISOString(),
  //     branch: payload.branchId,
  //     manager: payload.managerId,
  //     status: "Assigned"
  //   });

  //   // Update the manager's branch
  //   const manager = managerAccounts.value.find((manager) => manager.id === payload.managerId);
  //   if (manager) {
  //     manager.branch = payload.branchId;
  //     localStorageManagerAccount.value = manager; // Update the local storage variable
  //     // }
  //   }

  //   // Update the branch's manager
  //   const branch = branches?.value.find((branch) => branch.id === payload.branchId);
  //   if (branch) {
  //     branch.manager = payload.managerId;
  //   }

  //   saveManagerToLocalStorage();
  // }

  const allocateManager = async (payload: AssignManager) => {
    isLoading.value = true;
    try {
      await api.post("/agent-admin/assign-branch-manager", payload);
      // Update local state if needed
      const branch = branchStore.branches?.find(b => b.id === payload.branchId);
      if (branch) branch.manager = payload.managerId;
    } catch (err) {
      error.value = "Failed to assign branch manager";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Branch Manager Accounts
  const createBranchManagerAccount = async (payload: BranchManagerAccount) => {
    isLoading.value = true;
    try {
      const { data } = await api.post("/agent-admin/create-branch-manager-account", payload);
      managerAccounts.value.push(data.data);
      return data;
    } catch (err) {
      error.value = "Failed to create branch manager account";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateBranchManagerAccount = async (id: string, payload: Partial<ManagerAccount>) => {
    isLoading.value = true;
    try {
      const { data } = await api.put(`/agent-admin/edit-branch-manager-account/${id}`, payload);
      const index = managerAccounts.value.findIndex(m => m.id === id);
      if (index !== -1) managerAccounts.value[index] = data.data;
      return data;
    } catch (err) {
      error.value = "Failed to update branch manager account";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteBranchManagerAccount = async (id: string) => {
    isLoading.value = true;
    try {
      await api.delete(`/agent-admin/delete-branch-manager-account/${id}`);
      managerAccounts.value = managerAccounts.value.filter(m => m.id !== id);
    } catch (err) {
      error.value = "Failed to delete branch manager account";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch Accounts
  const fetchBackofficeAccounts = async () => {
    isLoading.value = true;
    try {
      const { data } = await api.get("/agent-admin/back-office-accounts");
      backofficeAccounts.value = data.data;
    } catch (err) {
      error.value = "Failed to fetch back office accounts";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchBranchManagers = async () => {
    isLoading.value = true;
    try {
      const { data } = await api.get("/agent-admin/branch-manager-accounts");
      managerAccounts.value = data.data;
    } catch (err) {
      error.value = "Failed to fetch branch managers";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Assign Manager to Branch
  // const assignBranchManager = async (payload: AssignManager) => {
  //   isLoading.value = true;
  //   try {
  //     await api.post("/agent-admin/assign-branch-manager", payload);
  //     // Update local state if needed
  //     const branch = branchStore.branches?.find(b => b.id === payload.branchId);
  //     if (branch) branch.manager = payload.managerId;
  //   } catch (err) {
  //     error.value = "Failed to assign branch manager";
  //     throw err;
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  //accept 2 parameters, branchId and managerId
  const assignBranchManager = async (userId: string, branchId: string) => {
    console.log("assignBranchManager", userId, branchId);
    isLoading.value = true;
    // const user = managerAccounts.value.find((user) => user.id === userId);
    const user = backofficeAccounts.value?.find((account) => account.id === userId); // Find user by `userId`
    const branch = branchStore.branches?.find((branch) => branch.id === branchId);

    if (user && branch) {
      const { data } = await api.post("/agent-admin/create-branch-manager-account", {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: "branchManager",
        password: user.password,
        unharshedPassword: user.password,
        backofficeUserId: user.id,
        // status: user.status,
        // createdAt: new Date().toISOString(),
        // emailVerified: true,
        // phoneVerified: true,
        // activatedAt: new Date().toISOString(),
        branch: branch.name, // Include branchId
      });

      managerAccounts.value?.push(data.data);
      console.log(`Manager assigned to branch ${branch.name}`);
      console.log(`Manager assigned to branch ${branchId}`);
    } else {
      console.warn(`User with ID ${userId} not found.`);
      alert(`User with ID ${userId} not found.`);
    }
  };

  return {
    isLoading,
    error,
    backofficeAccounts,
    managerAccounts,
    allocateManager,
    addBackOfficeAccount,
    createBranchManagerAccount,
    updateBranchManagerAccount,
    deleteBranchManagerAccount,
    fetchBackofficeAccounts,
    fetchBranchManagers,
    assignBranchManager
  };
});