<script setup lang="ts">
import AppModal from "@/components/AppModal.vue";
import { onMounted, ref, type Ref, watch, computed } from "vue";
import CreateBranch from "@/agentadmindomain/branches/components/CreateBranch.vue";
import { useBranchStore } from "@/agentadmindomain/branches/stores"; // Updated import
import type { Branch } from "@/agentadmindomain/branches/types"; // Assuming you have a Branch type
import moment from "moment/moment";
import router from "@/router";
import { useProviderStore } from "@/agentadmindomain/entities/stores";
import AssignBranchManager from "@/agentadmindomain/branches/components/AssignBranchManager.vue";
import EditBranch from "@/agentadmindomain/branches/components/EditBranch2.vue";
// import CategorySelector from "@/agentadmindomain/settings/components/CategorySelector.vue";
import { useNotificationsStore } from "@/stores/notifications";
import type { ApiError } from "@/types";
import { useAccountStore } from "../auth/stores";
// import TableLoader from "@/components/TableLoader.vue";
import { useBilling } from "@/agentadmindomain/finances/stores";

const billingStore = useBilling();

import { useAccounts } from "@/agentadmindomain/accounts/stores";
const accountStore = useAccounts();
const branchStore = useBranchStore(); // Updated store
const modalOpen: Ref<boolean> = ref(false);
const categoryModalOpen: Ref<boolean> = ref(false);
const editModalOpen: Ref<boolean> = ref(false);
const assignManagerModalOpen: Ref<boolean> = ref(false);
const page: Ref<number> = ref(1);
const limit: Ref<number> = ref(8);
const loading: Ref<boolean> = ref(false);
const selectedBranch: Ref<string> = ref("");
const selectedBranchToClose = ref<Branch | null>(null);

const branches: Ref<any[]> = ref([]);
// let providerId = ref("");
let status = ref("");
const notify = useNotificationsStore();
const showBranchCloseModal: Ref<boolean> = ref(false);

const totalRecords = computed(() => branchStore.branches.length); // Total branches
const totalPages = computed(() => Math.ceil(totalRecords.value / limit.value));
const pageInput = ref(1);
const changePageSize = () => {
  page.value = 1;
  fetchBranches();
};
const showPagination = computed(() => totalRecords.value >= limit.value);

function branchCloseModal(branch: Branch) {
  // localStorage.setItem("branch", JSON.stringify(branch));
  selectedBranchToClose.value = branch;
  showBranchCloseModal.value = true;
}

const jumpToPage = () => {
  if (pageInput.value > totalPages.value) { 
    page.value = totalPages.value;
  } else if (pageInput.value < 1) {
    page.value = 1;
  } else {
    page.value = pageInput.value;
  }
  fetchBranches();
};

// Helper function to get manager by branch
const getManagerByBranch = (branchName) => {
  // return accountStore.managerAccounts.find(
  console.log(accountStore.managerAccounts);

  return accountStore.managerAccounts?.find(
    (manager) => manager.branch === branchName
  );
};

async function fetchBranches() {
  loading.value = true;
  try {
    await branchStore.fetchBranches();
    branches.value = branchStore.branches?.slice(
      (page.value - 1) * limit.value,
      page.value * limit.value
    );
  } catch (error) {
    notify.error(error.response?.data?.message || "Error fetching branches");
  } finally {
    loading.value = false;
  }
}

function open(branch: Branch) {
  router.push({ name: "branch-details", params: { id: branch.id } });
}

// edit branch
function editBranch(branch: Branch) {
  branchStore.branches?.forEach((branch) => {
    const manager = getManagerByBranch(branch.name);
    if (manager) {
      branch.manager = manager.email;
    }
  });
  localStorage.setItem("branch", JSON.stringify(branch));
  editModalOpen.value = true;
  console.log("Branch to edit: ", branch);
}

//configure branch
function configure(branch: Branch) {
  localStorage.setItem("branch", JSON.stringify(branch));
  router.push({ name: "branch-configuration", params: { id: branch.id } });
}

function convertDateTime(date: string) {
  return moment(date).format("DD-MM-YYYY HH:mm:ss");
}

// async function deleteBranch(branch: Branch) {
//   try {
//     await branchStore.deleteBranch(branch.id);
//     branches.value = branches.value.filter((b) => b.id !== branch.id);
//     notify.success("Branch Deleted");
//   } catch (error) {
//     notify.error(error.response?.data?.message || "Error deleting branch");
//   }
// }
async function deleteBranch(branch: Branch | null) {
  if (!branch) return; // Defensive check

  try {
    await branchStore.deleteBranch(branch.id);
    branches.value = branches.value.filter((b) => b.id !== branch.id);
    notify.success("Branch Deleted");
    showBranchCloseModal.value = false; // Close the modal
  } catch (error: any) {
    notify.error(error.response?.data?.message || "Error deleting branch");
  }
}

// function deleteBranch(branch: Branch) {
//   try {
//     // Filter out the branch from the local array
//     branches.value = branches.value.filter((b) => b.id !== branch.id);
//     // Optionally, close the modal if it's open
//     showBranchCloseModal.value = false;
//     // Notify the user of success
//     notify.success("Branch Deleted (front end only)");
//   } catch (error: any) {
//     notify.error(error.response?.data?.message || "Error deleting branch");
//   }
// }

function assignManager(branch: Branch) {
  // Logic to open the modal or start the process
  console.log(`Assigning manager for branch: ${branch.name}`);
  selectedBranch.value = branch.id;
  // Example: modalOpen.value = true;
  assignManagerModalOpen.value = true;
}

// function deleteBranch(branchId: string) {
//   branchStore.deleteBranch(branchId); // Assuming this is a mutation to remove the branch
//   // branchStore.branches = branchStore.branches.filter((b) => b.id !== branchId); // Manually update the store
//   // fetchBranches(); // Refetch the branches after deleting, if needed
//   notify.success("Branch Deleted");
// }

function close() {
  modalOpen.value = false;
}

function closeViewModal() {
  editModalOpen.value = false;
}
function closeManagerAssignmentModal() {
  assignManagerModalOpen.value = false;
}

function closeEditModal() {
  assignManagerModalOpen.value = false;
}

function next() {
  page.value += 1;
  fetchBranches();
}

function previous() {
  page.value -= 1;
  fetchBranches();
}

watch(
  () => modalOpen.value,
  (isOpen: boolean) => {
    if (!isOpen) {
    }
  }
);

// const paginatedServices = computed(() => {
//   const start = (page.value - 1) * limit.value;
//   const end = start + limit.value;
//   return store.services.slice(start, end);  // Adjust according to your page & limit
// });

const paginatedBranches = computed(() => {
  const start = (page.value - 1) * limit.value;
  const end = start + limit.value;
  // return branchStore.branches.slice(start, end); // Adjust according to your page & limit
  return branchStore.fetchBranches();
});

// Helper function to assign managers to branches
const assignManagersToBranches = () => {
  branchStore.branches?.forEach((branch) => {
    const manager = getManagerByBranch(branch.name);
    if (manager) {
      branch.manager = manager;
    }
  });
};

const branchManagers = computed(() => {
  return accountStore.managerAccounts.reduce((map, manager) => {
    map[manager.branch] = manager;
    return map;
  }, {} as Record<string, any>);
});

const searchQuery = ref("");
const filteredBranches = computed(() => {
  return branches.value.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (branch.manager &&
        branch.manager.firstName
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()))
  );
});

// const branchManagerFloatBalance = ref(0);

// onMounted(()=>{
//     const savedFloatManagerBalance = JSON.parse(localStorage.getItem('branchManagerFloatBalance'));

//     if (savedFloatManagerBalance) {
//       branchManagerFloatBalance.value = savedFloatManagerBalance;
//     }
//   })

onMounted(() => {
  loading.value = true;
  fetchBranches();
  accountStore.fetchBranchManagers();
  branchStore.fetchBranches();
  accountStore.fetchBranchManagers();
  // allocateManager();
  assignManagersToBranches();
});
</script>

<template>
  <div class="w-full shadow-lg bg-white rounded p-2 flex flex-col min-h-[85vh]">
    <div class="flex">
      <div class="w-full py-1 text-primary-700">
        <!-- <i
          class="bg-primary-100 border border-primary-200 p-2 rounded-full fa-solid fa-code-branch"
        ></i> -->
        <i
          class="bg-primary-100 border border-primary-200 p-2 rounded-full fa-solid fa-building"
        ></i>
        <label class="text-lg mx-1">Branches</label>
      </div>
    </div>
    <div class="flex justify-between my-1">
      <div class="flex flex-col">
        <!-- <div class="grid grid-cols-5"> -->
        <!-- <input
            class="filter-element e-input"
            type="text"
            placeholder="Search by Name"
          /> -->
        <!-- <select class="filter-element e-select" v-model="providerId">
            <option :value="null">- Select Provider -</option>
            <option
              v-for="(provider, idx) in providerStore.providers"
              :key="idx"
              :value="provider.id"
            >
              {{ provider.name }}
            </option>
          </select> -->
        <!-- <select class="filter-element e-select" v-model="status">
            <option :value="null">- Select Status -</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select> -->
        <!-- </div> -->
        <div
          class="w-[50vw] bg-white rounded-md flex items-center justify-center border border-gray-100 px-4 focus:ring-2 focus:ring-red-500"
        >
          <input
            type="text"
            placeholder="Search Managers"
            class="w-full text-sm border-none outline-none bg-white"
          />
          <i class="fas fa-search p-2 cursor-pointer text-gray-300 text-lg"></i>

          <!-- <button
      class="ml-4 px-6 py-2 bg-red-700 text-white rounded-md text-sm hover:bg-primary-600 transition duration-300 ease-in-out"
      @click="search"
    >
      Search
    </button> -->
        </div>
      </div>
      <div class="flex">
        <button
          @click="modalOpen = true"
          class="button btn-sm my-auto"
          type="button"
        >
          <i class="px-1 fa-solid fa-plus"></i> Add Branch
        </button>
      </div>
    </div>
    <div class="flex my-1">
      <table class="table">
        <thead>
          <tr class="">
            <!-- <th class="t-header">#</th> -->
            <th class="t-header">Name</th>
            <th class="text-left">Manager</th>
            <th class="text-left">Date</th>
            <th class="text-right">Actions</th>
            <!-- <th class="t-header"></th> -->
          </tr>
        </thead>
        <thead v-if="loading">
          <tr>
            <th colspan="" style="padding: 0">
              <div
                class="w-full bg-primary-300 h-1 p-0 m-0 animate-pulse"
              ></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- <tr
            class="body-tr"
            v-for="(branch, idx) in filteredBranches"
            :key="idx"
          > -->
          <tr
            class="body-tr"
            v-for="(branch, idx) in branchStore.branches"
            :key="idx"
          >
            <!--
          <tr
            class="body-tr"
            v-for="(branch, idx) in paginatedBranches"
            :key="idx"
          > -->
            <!-- <td width="10px">{{ idx + 1 }}.</td> -->
            <td>
              <label
                class="cursor-pointer font-bold hover:text-primary-700 mx-2"
              >
                <span class="hover:underline" @click="open(branch)">
                  {{ branch.name }}
                </span>
                <!-- <i
                  class="fa-solid fa-link p-1 mx-1 text-gray-600 bg-gray-50 hover:text-primary-700"
                  @click="tag(branch)"
                ></i> -->
              </label>
            </td>

            <!-- <td class="text-black-700">
              <div v-if="getManagerByBranch(branch.name)">
                <label
                  >{{ getManagerByBranch(branch.name).firstName }}
                  {{ getManagerByBranch(branch.name).lastName }}</label
                >
              </div>
              <div v-else>
                <button
                  class="bg-red-200 rounded-md font-semibold text-red-700 p-1 hover:underline"
                  @click="allocateManager(branch)"
                >
                  Allocate Manager
                </button>
              </div>
            </td> -->

            <td class="text-black-700 text-left">
              <!-- First Case: Manager linked via `getManagerByBranch()` -->
              <div v-if="getManagerByBranch(branch.name)">
                <label>
                  {{ getManagerByBranch(branch.name).firstName }}
                  {{ getManagerByBranch(branch.name).lastName }}
                </label>
              </div>

              <!-- Second Case: Manager directly assigned to branch -->
              <div v-else-if="branch.manager">
                <label>
                  {{ branch.manager.firstName }} {{ branch.manager.lastName }}
                </label>
              </div>

              <!-- Third Case: Fallback, no manager assigned -->
              <!-- <div v-else>
                <button
                  class="bg-red-200 rounded-sm text-xs font-semibold text-red-700 px-1.5 py-1 hover:underline"
                  @click="assignManager(branch)"
                >
                  <i class="fa fa-user-plus"></i>
                  Assign Manager
                </button>
              </div> -->
              <div v-else>
                <button
                  class="bg-red-700 rounded-md text-xs font-semibold text-white px-1.5 py-1 hover:underline"
                  @click="assignManager(branch)"
                >
                  <i class="fa fa-user-plus"></i>
                  Assign Manager
                </button>
              </div>
            </td>

            <!-- <td class="text-center">
              <i
                :class="
                  branch.isActive
                    ? 'text-green-600 fa-solid fa-check'
                    : 'text-red-600 fa-solid fa-times'
                "
              ></i>
            </td> -->

            <!-- <i
                class="fa-solid fa-eye p-1 mx-1 text-blue-600 bg-blue-100 border border-blue-200 hover:text-blue-700"
                @click="open(branch)"
              ></i>
  <i
                class="fa-solid fa-trash p-1 mx-1 text-red-600 bg-red-100 border border-red-200 hover:text-red-700"
                @click="deleteBranch(branch.id)"
              ></i>
            <td class="text-center">
  <span>{{ branch.status }}</span>
</td> -->
            <td class="text-left">
              <span class="text-xs">{{
                convertDateTime(branch.createdAt)
              }}</span>
            </td>
            <td class="text-right">
              <!-- <i
                class="fa-solid fa-eye p-1 mx-1 text-blue-600 bg-blue-100 border border-blue-200 hover:text-blue-700"
                @click="open(branch)"
              ></i> -->
              <span
                class="p-1 mx-1 rounded-md text-white bg-blue-600 hover:bg-blue-200 hover:text-blue-600"
                @click="editBranch(branch)"
              >
                <i class="fa-solid fa-pen"></i>
                Edit
              </span>

              <span
                class="rounded-md p-1 mx-1 text-white bg-red-700 hover:bg-red-200 hover:text-red-700"
                @click="branchCloseModal(branch)"
              >
                <!-- <span
                class="rounded-md p-1 mx-1 text-white bg-red-700 hover:bg-red-200 hover:text-red-700"
                @click="deleteBranch(branch)"
              > -->
                <!-- <i
                  class="fa-solid fa-store-slash"
                  @click="deleteBranch(branch)"
                ></i> -->
                <i class="fa-solid fa-store-slash"></i>
                Close
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div class="flex text-sm"> -->
    <!-- <div class="flex text-xs mt-auto"> -->
    <div v-if="showPagination" class="flex text-xs mt-auto">
      <div class="w-full border-t border-b border-gray-50">
        <div class="flex gap-2 items-center">
          <!-- Previous Button -->
          <button
            class="px-1 py-0.5 text-red-600 rounded-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'opacity-50 cursor-not-allowed': page <= 1 }"
            :disabled="page <= 1"
            @click="previous"
          >
            <i class="fa-solid fa-arrow-left"></i>
          </button>

          <!-- Current Page / Total Pages -->
          <div class="py-1">
            <span class="px-2 py-1 bg-primary rounded text-white">{{
              page
            }}</span>
            <label class="mx-1 text-gray-400">/</label>
            <span class="px-2 py-1 bg-primary-50 rounded text-primary-600">
              {{ totalPages }}
            </span>
          </div>
          <button
            class="px-1 py-0.5 text-red-600 rounded-md hover:bg-red-700 hover:text-white focus:outline-none focus:ring focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{
              'opacity-50 cursor-not-allowed': branches.length < limit,
            }"
            :disabled="branches.length < limit"
            @click="next"
          >
            <i class="fa-solid fa-arrow-right"></i>
          </button>

          <!-- Jump to Page -->
          <label>Page</label>
          <input
            type="number"
            placeholder="Page"
            class="form-element-lean bg-primary-50 font-bold text-center mx-1 w-12"
            v-model.number="pageInput"
            @change="jumpToPage"
          />

          <!-- Adjust Page Size -->
          <label>Page Size</label>
          <input
            type="number"
            placeholder="Page Size"
            class="form-element-lean bg-primary-50 font-bold text-center mx-1 w-12"
            v-model.number="limit"
            @change="changePageSize"
          />

          <!-- Total Records -->
          <span
            class="my-auto mx-2 bg-primary-50 px-3 py-1 rounded text-primary"
          >
            Total Records: {{ totalRecords }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Approve Modal -->
  <AppModal v-model="showBranchCloseModal" xl>
    <div class="flex">
      <div class="w-full">
        <div class="flex">
          <span class="mx-auto text-center justify-center">
            <i
              class="mx-auto fa-solid fa-exclamation-circle text-3xl text-danger"
            ></i>
          </span>
        </div>
        <p class="py-5 text-center">
          Are you sure you want to close this branch?
        </p>
        <div class="flex w-1/2 gap-2 justify-center mx-auto">
          <!-- <button
            class="bg-gray-600 hover:bg-gray-500 w-1/2 rounded text-white"
            @click="showBranchCloseModal = false"
          >
            <i class="fa-solid fa-times-circle mx-1"></i> Cancel
          </button> -->
          <button
            class="bg-red-600 hover:bg-red-800 w-1/2 rounded text-white"
            @click="showBranchCloseModal = false"
          >
            <i class="fa-solid fa-times-circle mx-1"></i> Cancel
          </button>
          <button
            class="bg-green-700 text-white p-1 w-1/2 rounded hover:bg-green-800"
            @click="deleteBranch(selectedBranchToClose)"
          >
            <i class="fa-solid fa-check-circle mx-1"></i> Confirm
          </button>
        </div>
      </div>
    </div>
  </AppModal>

  <!-- Modal -->
  <AppModal v-model="modalOpen" xl2>
    <!-- Put here whatever makes you smile -->
    <!-- Chances are high that you're starting with a form -->
    <CreateBranch @branchCreated="close" @cancel="close" />
    <!-- That's also okay -->
  </AppModal>

  <AppModal v-model="editModalOpen" xl2>
    <!-- Put here whatever makes you smile -->
    <EditBranch @cancel="closeEditModal" />
    <!-- That's also okay -->
  </AppModal>
  <!-- /Modal -->

  <!-- Assign Manager Modal -->
  <AppModal v-model="assignManagerModalOpen" xl2>
    <!-- Put here whatever makes you smile -->
    <!-- Chances are high that you're starting with a form -->
    <AssignBranchManager
      :branchId="selectedBranch"
      @managerAssigned="closeManagerAssignmentModal"
      @cancel="close"
    />
    <!-- That's also okay -->
  </AppModal>
</template>

<style scoped>
@import "@/assets/styles/forms.css";
@import "@/assets/styles/button.css";
@import "@/assets/styles/table.css";
@import "@/assets/styles/widgets.css";
</style>
