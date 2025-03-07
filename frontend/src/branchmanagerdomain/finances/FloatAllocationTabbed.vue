<script setup lang="ts">
import AppModal from "@/components/AppModal.vue";
import { useBilling } from "@/branchmanagerdomain/finances/stores";
import { onMounted, type Ref, ref, reactive, watch, computed } from "vue";
import AllocateFloat from "@/branchmanagerdomain/finances/components/AllocateFloat.vue";
import { useDebounceFn } from "@vueuse/core";
import type { IGoFilter } from "@/types";
import moment from "moment";
import type {
  IResendVerificationPayload,
  TAccountVerificationType,
} from "./types";
import Till1Ledger from "@/branchmanagerdomain/finances/components/Till1Ledger.vue";

const billingStore = useBilling();

const loading: Ref<boolean> = ref(false);
const modalOpen: Ref<boolean> = ref(false);
const page: Ref<number> = ref(1);
const limit: Ref<number> = ref(6);
const floatAllocations: Ref<any[]> = ref([]);
const totalRecords = computed(() => billingStore.floatAllocations.length); // Total floatAllocations
const totalPages = computed(() => Math.ceil(totalRecords.value / limit.value));
const pageInput = ref(1);
const changePageSize = () => {
  page.value = 1;
  fetchFloatAllocations();
};
// const showPagination = computed(() => totalRecords.value >= limit.value);

const jumpToPage = () => {
  if (pageInput.value > totalPages.value) {
    page.value = totalPages.value;
  } else if (pageInput.value < 1) {
    page.value = 1;
  } else {
    page.value = pageInput.value;
  }
  fetchFloatAllocations();
};
function fetchFloatAllocations() {
  // tillStore
  //   .fetchfloatAllocations(page.value, limit.value)
  //   .then(() => (loading.value = false))
  //   .catch((error: ApiError) => {
  //     loading.value = false;
  //     notify.error(error.response.data.message);
  //   });

  loading.value = true;
  // Fetch the services based on the page and limit
  const startIndex = (page.value - 1) * limit.value;
  const endIndex = startIndex + limit.value;
  floatAllocations.value = billingStore.floatAllocations.slice(
    startIndex,
    endIndex
  );
  loading.value = false;
}
const paginatedfloatAllocations = computed(() => {
  const start = (page.value - 1) * limit.value;
  const end = start + limit.value;
  return billingStore.floatAllocations.slice(start, end); // Adjust according to your page & limit
});

const showPagination = computed(() => totalRecords.value >= limit.value);

// filter
const filter: IGoFilter = reactive({
  limit: 100,
  offset: 0,
  page: 0,
  sort: [
    {
      field: "firstname",
      order: "ASC",
    },
  ],
  filter: [
    {
      field: "firstname",
      operand: "",
      operator: "CONTAINS",
    },
    {
      field: "username",
      operand: "",
      operator: "CONTAINS",
    },
    {
      field: "phone",
      operand: "",
      operator: "CONTAINS",
    },
  ],
});

onMounted(() => {
  fetch();
  billingStore.fetchFloatAllocations(); // Fetch transactions when the component mounts
  // billingStore.fetchFloatLedgers(); // Fetch float ledgers
});

function fetch() {
  filter.limit = limit.value;
  filter.page = page.value;
  billingStore.fetchBackofficeUsers(filter);
}

function open() {
  modalOpen.value = true;
}

function close() {
  modalOpen.value = false;
}

const reVerifyForm: IResendVerificationPayload = reactive({
  purpose: "",
  username: "",
});

const resend = (purpose: TAccountVerificationType, username: string) => {
  if (username.length === 0) return;
  reVerifyForm.purpose = purpose;
  reVerifyForm.username = username;
  billingStore.resendAccountVerification(reVerifyForm);
};

const updateFilter = useDebounceFn(
  () => {
    fetch();
  },
  300,
  { maxWait: 5000 }
);

// function convertDate(date: string) {
//   return moment(date).format("DD-MM-YYYY");
// }

function convertDateTime(date: string) {
  return moment(date).format("DD-MM-YYYY HH:mm:ss");
}

function next() {
  page.value += 1;
  fetch();
}

function previous() {
  page.value -= 1;
  fetch();
}

// watch state of the modal
watch(
  () => modalOpen.value,
  (isOpen: boolean) => {
    if (!isOpen) {
      fetch();
    }
  }
);

// watch for changes in the filter object
watch(
  () => filter,
  () => updateFilter(),
  { deep: true }
);

const activeTab: Ref<string> = ref("till1Ledger");

function select(tab: string) {
  activeTab.value = tab;
}
</script>

<template>
  <!-- <h2>Transactions</h2>
    </ul> -->
  <div class="shadow-lg bg-white rounded p-2">
    <div class="flex">
      <div class="w-2/12 text-xs">
        <div
          :class="activeTab == 'till1Ledger' ? 'tab-active' : 'tab'"
          @click="select('till1Ledger')"
        >
          <div class="w-full py-2 my-auto">
            <label class="p-3">Till 1</label>
            <i
              class="fa-solid fa-building float-right px-2 py-1"
              v-if="activeTab == 'till1Ledger'"
            ></i>
          </div>
        </div>
        <div
          :class="activeTab == 'till2Ledger' ? 'tab-active' : 'tab'"
          @click="select('till2Ledger')"
        >
          <div class="w-full py-2">
            <label class="p-3">Till 2</label>
            <i
              class="fa-solid fa-building float-right px-1 py-1"
              v-if="activeTab == 'till2Ledger'"
            ></i>
          </div>
        </div>
        <div
          :class="activeTab == 'till3Ledger' ? 'tab-active' : 'tab'"
          @click="select('till3Ledger')"
        >
          <div class="w-full py-2">
            <label class="p-3">Till 3</label>
            <i
              class="fa-solid fa-building float-right px-2 py-1"
              v-if="activeTab == 'till3Ledger'"
            ></i>
          </div>
        </div>
        <div
          :class="activeTab == 'till4Ledger' ? 'tab-active' : 'tab'"
          @click="select('till4Ledger')"
        >
          <div class="w-full py-2">
            <label class="p-3">Till 4</label>
            <i
              class="fa-solid fa-building float-right px-2 py-1"
              v-if="activeTab == 'till4Ledger'"
            ></i>
          </div>
        </div>
        <div
          :class="activeTab == 'till5Ledger' ? 'tab-active' : 'tab'"
          @click="select('till5Ledger')"
        >
          <div class="w-full py-2">
            <label class="p-3">Till 5</label>
            <i
              class="fa-solid fa-building float-right px-2 py-1"
              v-if="activeTab == 'till5Ledger'"
            ></i>
          </div>
        </div>
        <div
          :class="activeTab == 'till6Ledger' ? 'tab-active' : 'tab'"
          @click="select('till6Ledger')"
        >
          <div class="w-full py-2">
            <label class="p-3">Till 6</label>
            <i
              class="fa-solid fa-building float-right px-2 py-1"
              v-if="activeTab == 'till6Ledger'"
            ></i>
          </div>
        </div>
        <div
          :class="activeTab == 'till7Ledger' ? 'tab-active' : 'tab'"
          @click="select('till7Ledger')"
        >
          <div class="w-full py-2">
            <label class="p-3">Till 7</label>
            <i
              class="fa-solid fa-building float-right px-2 py-1"
              v-if="activeTab == 'till7Ledger'"
            ></i>
          </div>
        </div>
        <div
          :class="activeTab == 'till8Ledger' ? 'tab-active' : 'tab'"
          @click="select('till8Ledger')"
        >
          <div class="w-full py-2">
            <label class="p-3">Till 8</label>
            <i
              class="fa-solid fa-building float-right px-2 py-1"
              v-if="activeTab == 'till8Ledger'"
            ></i>
          </div>
        </div>
        <!-- <div :class="(activeTab == 'revenue') ? 'tab-active' : 'tab'" @click="select('revenue')">
          <div class="w-full py-1">
            <label class="p-3">Revenue</label>
            <i class="fa-solid fa-chart-area float-right px-2 py-1" v-if="activeTab == 'revenue'"></i>
          </div>
        </div>
        <div :class="(activeTab == 'users') ? 'tab-active' : 'tab'" @click="select('users')">
          <div class="w-full py-1">
            <label class="p-3">Users</label>
            <i class="fa-solid fa-chart-area float-right px-2 py-1" v-if="activeTab == 'users'"></i>
          </div>
        </div> -->
      </div>
      <div class="w-10/12">
        <Till1Ledger v-if="activeTab == 'till1Ledger'" />
        <!-- <ServicesStatistics v-if="activeTab == 'services'"/> -->
        <!-- <ApplicationsLineGraph v-if="activeTab == 'services'" />
      <ServiceStatusPieChart v-if="activeTab == 'serviceStatusPieChart'" />
      <RevenueStatistics v-if="activeTab == 'revenue'" />
      <UserStatistics v-if="activeTab == 'users'" /> -->
      </div>
    </div>

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
              'opacity-50 cursor-not-allowed': floatAllocations.length < limit,
            }"
            :disabled="floatAllocations.length < limit"
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
  <!-- Modal -->
  <AppModal v-model="modalOpen" xl2>
    <AllocateFloat @floatAllocated="close" @cancel="close" />
  </AppModal>
  <!-- /Modal -->
</template>

<style scoped>
@import "@/assets/styles/forms.css";
@import "@/assets/styles/button.css";
@import "@/assets/styles/table.css";
@import "@/assets/styles/widgets.css";

.tab-active {
  @apply flex border-2 border-gray-300 rounded-r cursor-pointer bg-gray-400 text-white font-bold;
}

.tab {
  @apply flex border border-gray-100 rounded-r cursor-pointer;
}
</style>
