import { ref, type Ref } from "vue";
import { defineStore } from "pinia";
import api from "@/config/api";
import type { Branch } from "@/agentadmindomain/branches/types";
import type { AssignManager } from "@/types";

export const useBranchStore = defineStore("useBranch", () => {
  const branches: Ref<Branch[] | undefined> = ref([]);
  const branch: Ref<Branch | undefined> = ref();
  const isLoading: Ref<boolean> = ref(false);
  const managerAssignments: Ref<AssignManager[]> = ref([]);

  async function fetchBranches() {
    isLoading.value = true;
    try {
      const { data } = await api.get("/agent-admin/branches");
      branches.value = data.data;
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      isLoading.value = false;
    }
  }

  // branches/stores.ts
  // const branches: Ref<Branch[]> = ref([]);

  // const fetchBranches = async (filter: any) => {
  //   const { data } = await api.get("/agent-admin/branches", { params: filter });
  //   branches.value = data;
  // };

  async function addBranch(newBranch: Branch) {
    try {
      const { data } = await api.post("/agent-admin/create-branch", newBranch);
      // branches.value = response.data
      // branches.value?.push(data.data);
      branches.value?.push(data);

    } catch (error) {
      console.error("Error adding branch:", error);
    }
  }

  async function assignManager(payload: AssignManager) {
    try {
      await api.post("/agent-admin/assign-branch-manager", payload);
      const branchToUpdate = branches.value?.find(branch => branch.id === payload.branchId);
      if (branchToUpdate) {
        branchToUpdate.manager = payload.managerId;
      }
    } catch (error) {
      console.error("Error assigning manager:", error);
    }
  }

  async function editBranch(branchId: string, updatedData: Partial<Branch>) {
    try {
      await api.put(`/agent-admin/edit-branch-details/${branchId}`, updatedData);
      const branchIndex = branches.value?.findIndex(branch => branch.id === branchId);
      if (branchIndex !== undefined && branchIndex !== -1) {
        branches.value![branchIndex] = { ...branches.value![branchIndex], ...updatedData };
      }
    } catch (error) {
      console.error("Error updating branch:", error);
    }
  }

  async function deleteBranch(branchId: string) {
    try {
      await api.delete(`/agent-admin/close-branch/${branchId}`);
      branches.value = branches.value?.filter((b) => b.id !== branchId);
    } catch (error) {
      console.error("Error closing branch:", error);
    }
  }

  return {
    branches,
    branch,
    managerAssignments,
    fetchBranches,
    assignManager,
    addBranch,
    editBranch,
    deleteBranch,
  };
});
