<script setup lang="ts">
import { onMounted, reactive, type Ref, ref, defineEmits } from "vue";
// import { useProviderStore } from "@/agentadmindomain/providers/stores";
import { useAccounts } from "@/agentadmindomain/accounts/stores";
// import type { CreateServiceProvider } from "@/agentadmindomain/providers/types";
// import type { AssignManager } from "@/types";
import { useNotificationsStore } from "@/stores/notifications";
import type { ApiError } from "@/types";
// import { ManagerAccount } from "@/types/index";
import { useBranchStore } from "@/agentadmindomain/branches/stores";
const branchStore = useBranchStore();

// const store = useProviderStore();
const accountStore = useAccounts();
const loading: Ref<boolean> = ref(false);
const notify = useNotificationsStore();

// let form: CreateServiceProvider = reactive({
//   name: "",
//   displayName: "",
//   displayLogo: null,
//   providerType:"GOVERNMENT",
//   physicalAddress: "",
//   inquiryEmail:"",
//   inquiryPhoneNumber:"",
//   username: ""
// })

// let form: AssignManager = reactive({
//   managerId: "",
//   branch: "",
//   firstName: "",
//   lastName: "",
//   email: "",
//   phone: "",
// });

// let form: ManagerAccount = reactive({
//   managerId: "",
//   branch: "",
//   firstName: "",
//   lastName: "",
//   email: "",
//   phone: "",
// });

let form: ManagerAccount = reactive({
  id: "",
  name: "",
  status: "",
  firstName: "",
  lastName: "",
  middleNames: "",
  username: "",
  email: "",
  branchName: "",
  branch: "",
  phone: "",
  role: "",
  createdAt: "",
  // emailVerified: "",
  phoneVerified: "",
  activatedAt: "",
});

const emit = defineEmits(["cancel", "managerAssigned"]);

// onMounted(() => {
//   let data = JSON.parse(<string>localStorage.getItem("provider"))

//   form.name = data.name
//   form.displayName = data.displayName
//   form.physicalAddress = data.physicalAddress
//   form.inquiryEmail = data.inquiryEmail
//   form.inquiryPhoneNumber = data.inquiryPhoneNumber
//   form.username = data.username
// })

// function submit(){
//   loading.value = true
//   let data = JSON.parse(<string>localStorage.getItem("provider"))

//   let id = data.id
//   let payload = {
//     name:form.name,
//     display_name:form.displayName,
//     inquiry_email:form.inquiryEmail,
//     provider_type:form.providerType,
//     inquiry_phone_number:form.inquiryPhoneNumber,
//     physical_address:form.physicalAddress,
//     username:form.username
//   }
//   store
//       .editProvider(id, payload)
//       .then(() => {
//         loading.value = false
//         window.location.reload()
//         notify.error("Edited")
//       })
//       .catch((error:ApiError) => {
//         loading.value = false
//         notify.error(error.response.data.message)
//       })
// }

function submit(userId: string) {
  // let payload = {
  //   // userId: form.userId,
  //   userId: userId,
  //   branchId: branchId,
  // };
  // let data = JSON.parse(<string>localStorage.getItem("branchManagerAccount"));
  let data = JSON.parse(<string>localStorage.getItem("branch"));

  // let id = data.id;
  let payload = {
    branch: form.branch,

    // firstName: form.firstName,
    // lastName: form.lastName,
    // email: form.email,
    // phone: form.phone,
    // inquiry_phone_number: form.inquiryPhoneNumber,
    // physical_address: form.physicalAddress,
    // username: form.username,
  };

  loading.value = true;
  branchStore.addBranch(payload); // If you were adding a new branch or you can update it via another method
  // branchStore.editBranch(payload)
  loading.value = false;
  // accountStore.assignManager(payload.id, payload.branchId);
  // accountStore.assignManager(id, payload.branch);
  // store.assignManager(userId);
  // notify.success(`User successfully ${payload.userId} assigned to branch`);
  notify.success(`Branch name changed successfully`);
  emit("managerAssigned");
  loading.value = false;
}

onMounted(() => {
  //   let data = JSON.parse(<string>localStorage.getItem("provider"))
  // let data = JSON.parse(<string>localStorage.getItem("branchManagerAccount"));
  let data = JSON.parse(<string>localStorage.getItem("branch"));

  form.branch = data.branch;
  form.name = data.name;
  // form.firstName = data.firstName;
  // form.lastName = data.lastName;
  // form.email = data.email;
  // form.phone = data.phone;
  // form.username = data.username;
});
</script>

<template>
  <div class="bg-white py-5">
    <p class="text-xl font-bold">Edit Branch Details</p>
    <!-- <p class="text-sm text-gray-500" v-if="form.name">
      <b>{{ form.name }}</b> provides a services consumed by the general public
      of Uganda.
    </p> -->
    <form @submit.prevent="submit" class="pt-5">
      <div class="flex">
        <div class="cell-full">
          <label class="block uppercase text-neutral-600 text-xs font-bold mb-1"
            >Branch Name</label
          >
          <!-- <input
            type="text"
            v-model="form.branch"
            class="noFocus form-element e-input w-full"
            required
          /> -->
           <input
            type="text"
            v-model="form.name"
            class="noFocus form-element e-input w-full"
            required
          />
        </div>
      </div>

      <!-- <div class="flex">
        <div class="cell-full">
          <label class="block uppercase text-neutral-600 text-xs font-bold mb-1"
            >Provider Type</label
          >
          <select
            v-model="form.providerType"
            class="noFocus form-element e-input w-full"
          >
            <option value="GOVERNMENT">Government Entity</option>
            <option value="PRIVATE">Private Company</option>
          </select>
        </div>
      </div> -->
      
      <!-- <div class="flex">
        <div class="cell">
          <label class="block uppercase text-neutral-600 text-xs font-bold mb-1"
            >First Name</label
          >
          <input
            type="text"
            v-model="form.firstName"
            class="noFocus form-element e-input w-full"
            required
          />
        </div>
        <div class="cell">
          <label class="block uppercase text-neutral-600 text-xs font-bold mb-1"
            >Last Name</label
          >
          <input
            type="text"
            v-model="form.lastName"
            class="noFocus form-element e-input w-full"
            required
          />
        </div>
      </div> -->

      <!-- <p class="text-sm font-bold pt-5">Provider Inquiry Details</p> -->
      <!-- <div class="flex">
        <div class="cell">
          <label class="block uppercase text-neutral-600 text-xs font-bold mb-1"
            >Email Address</label
          >
          <input
            type="email"
            v-model="form.email"
            class="noFocus form-element e-input w-full"
          />
        </div>
        <div class="cell">
          <label class="block uppercase text-neutral-600 text-xs font-bold mb-1"
            >Phone Number</label
          >
          <input
            type="tel"
            v-model="form.phone"
            class="noFocus form-element e-input w-full"
          />
        </div>
      </div> -->
      <!-- <div class="flex">
        <div class="cell-full">
          <label class="block uppercase text-neutral-600 text-xs font-bold mb-1"
            >Physical Address</label
          >
          <textarea
            v-model="form.physicalAddress"
            class="noFocus form-element e-input w-full"
            cols="4"
            placeholder="Address Description"
          />
        </div>
      </div> -->

      <div class="flex my-2 py-5">
        <div class="w-6/12 px-1">
          <button class="button-outline" type="button" @click="emit('cancel')">
            <i class="fa-solid fa-ban"></i> Cancel
          </button>
        </div>
        <div class="w-6/12 px-1">
          <button class="button" type="submit">
            <i class="fa-solid fa-hand-pointer"></i> Submit
            <span class="lds-ring mx-1" v-if="loading">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import "@/assets/styles/button.css";
@import "@/assets/styles/forms.css";
@import "@/assets/styles/ring.css";
@import "@/assets/styles/ripple.css";

.cell {
  @apply w-6/12 px-1 my-2;
}

.cell-full {
  @apply w-full px-1 my-2;
}
</style>




