// domain/billing/stores.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/config/api";
import type { Transaction, FloatLedger, BackofficeUser, TillOperator, FloatAllocation, FloatRequest, RequestFloatToAdmin } from "@/branchmanagerdomain/finances/types";
import type { AllocateFloat } from "@/types";
import type { Till } from "@/branchmanagerdomain/tills/types";

export const useBilling = defineStore("billing", () => {
  //  data for testing

  // use this for  transactions
  // <tr class="text-left">
  //           <!-- <th>#</th> -->
  //           <th>Tracking Number</th>
  //           <th>Service</th>
  //           <th>Provider</th>
  //           <th>Till</th>
  //           <!-- <th>Transaction Type</th> -->
  //           <th>Fee</th>
  //           <!-- <th>Status</th> -->
  //           <th>Date</th>
  //           <!-- <th>Actions</th> -->
  //         </tr>

  const Transactions: Transaction[] = [
    {
      id: 1, trackingNumber: "TA123456",
      service: "Company Name Reservation", provider: "URSB", till: "Till 001",
      fee: 25000, date: "2021-09-01", status: "success", transactionID: "123456",
    },
    {
      id: 2, trackingNumber: "TB123457",
      service: "Create Postal Account", provider: "Posta Uganda",
      till: "Till 002", fee: 20000, date: "2021-09-02", status: "failed", transactionID: "123456",
    },
    {
      id: 3, trackingNumber: "TC123458",
      service: "National ID registration", provider: "NIRA",
      till: "Till 003", fee: 35000, date: "2021-09-03", status: "pending", transactionID: "123456",
    },
  ];


  // use this for  float requests
  // <th class="text-left">Date</th>
  // <th class="text-left">Name</th>
  // <th class="text-left"> till</th>
  // <th class="text-left">Amount</th>
  // <th class="text-left">Actions</th>

  const FloatRequests: FloatRequest[] = [
    { id: 1, requestDate: "2021-09-01", amount: 12000000, status: "pending", till: "Till 1", approvedBy: null, requesterName: "", createdAt: "" },
    { id: 4, requestDate: "2021-09-04", amount: 10000000, status: "pending", till: "Till 4", approvedBy: null, requesterName: "", createdAt: "" },
    { id: 2, requestDate: "2021-09-02", amount: 18000000, status: "approved", till: "Till 2", approvedBy: "Manager One", requesterName: "", createdAt: "", date: "" },
    { id: 3, requestDate: "2021-09-03", amount: 9000000, status: "rejected", till: "Till 3", approvedBy: null, requesterName: "", createdAt: "" },
  ];

  const dummyFloatRequestsToAdmin: FloatRequest[] = [
    { id: 1, requestDate: "2021-09-01", amount: 12000000, status: "pending", approvedBy: null, requesterName: "", createdAt: "", description: "Recharge", branch: "Branch 1" },
    { id: 4, requestDate: "2021-09-04", amount: 10000000, status: "failed", approvedBy: null, requesterName: "", createdAt: "", description: "Recharge", branch: "Branch 1" },
    { id: 2, requestDate: "2021-09-02", amount: 18000000, status: "approved", approvedBy: "Manager One", requesterName: "", createdAt: "", date: "", description: "Recharge", branch: "Branch 1" },
    { id: 3, requestDate: "2021-09-03", amount: 9000000, status: "rejected", approvedBy: null, requesterName: "", createdAt: "", description: "Recharge", branch: "Branch 1" },
  ];

  const FloatLedgers: FloatLedger[] = [
    { id: 1, date: "2021-09-01", description: "Recharge", amount: 20000000, balance: 20000000 },
    // { id: 2, date: "2021-09-02", description: "Till 1", amount: -20000000, balance: 450000000 },
  ];

  const BackofficeUsers: BackofficeUser[] = [
    { id: 1, username: "admin1", fullName: "Jack Mwebe", role: "Administrator", till: "Till 1", status: "Active" },
    { id: 2, username: "manager1", fullName: "Katamba Johnson", role: "Manager", till: "Till 2", status: "Active" },
    { id: 3, username: "admin2", fullName: "Kasule Ronald", role: "Administrator", till: "Till 3", status: "Inactive" },
  ];

  //   till manager data
  const TillOperators: TillOperator[] = [
    { id: 1, username: "manager1", fullName: "Manager User One", role: "Manager", till: "Till 1", status: "Active" },
    { id: 2, username: "manager2", fullName: "Manager User Two", role: "Manager", till: "Till 2", status: "Active" },
    { id: 3, username: "manager3", fullName: "Manager User Three", role: "Manager", till: "Till 3", status: "Inactive" },
  ];

  //  float assignment data
  const FloatAllocations: FloatAllocation[] = [
    { id: 1, dateAssigned: "2021-09-01", amount: 10000000, status: "Allocated", till: "Till 1" },
    { id: 2, dateAssigned: "2021-09-02", amount: 21000000, status: "pending", till: "Till 2" },
    { id: 3, dateAssigned: "2021-09-03", amount: 17000000, status: "failed", till: "Till 3" },
  ];


  // State variables
  const transactions = ref<Transaction[]>(Transactions); // Use  data for now
  const totalAmount = ref(600); // Set a test value
  const totalBalance = ref(3000); // Set a test value
  // const floatLedgers = ref<FloatLedger[]>(FloatLedgers); // Use  data for now
  const floatLedgers = ref<FloatLedger[]>([]); // Use  data for now
  const tillFloatLedgers = ref<FloatLedger[]>([]);
  const backofficeUsers = ref<BackofficeUser[]>(BackofficeUsers);
  const tillOperators = ref<TillOperator[]>(TillOperators);
  const floatAllocations = ref<FloatAllocation[]>(FloatAllocations);
  // const floatRequests = ref<FloatRequest[]>(FloatRequests);
  const floatRequests = ref<FloatRequest[]>([]);
  // const floatRequestsToAdmin = ref<FloatRequest[]>(dummyFloatRequestsToAdmin);
  const floatRequestsToAdmin = ref<FloatRequest[]>([]);

  const tills: Ref<Till[] | undefined> = ref([]);
  const till: Ref<Till | undefined> = ref();
  const isLoading: Ref<boolean> = ref(false);


  // const floatRequests = JSON.parse(localStorage.getItem('floatRequestToBranchManagerLocalStorage') || '[]');

  // if (floatRequests) {
  //   floatRequests.value = floatRequests;
  // }





  // Actions to fetch data
  async function fetchTransactions(filter: any) {
    // Simulate API call
    // const response = await fetch(`/api/transactions?limit=${filter.limit}&page=${filter.page}`);
    // const data = await response.json();
    // Use  data for now
    transactions.value = Transactions;
    // totalAmount.value = 600;  // Set a test value
    // totalBalance.value = 450000000; // Set a test value
  }

  // async function fetchFloatLedgers(filter: any) {
  //   // Simulate API call
  //   // const response = await fetch(`/api/float-ledgers?limit=${filter.limit}&page=${filter.page}`);
  //   // const data = await response.json();
  //   // Use  data for now
  //   floatLedgers.value = FloatLedgers;
  // }
  async function fetchFloatLedgers() {
    const { data } = await api.get("/branch-manager/float-ledgers");
    floatLedgers.value = data.data;
    console.log("Float Ledgers:", floatLedgers.value);
  }

  async function fetchTillFloatLedgers() {
    const { data } = await api.get("/till-operators/float-ledgers");
    tillFloatLedgers.value = data.data;
    console.log("Float Ledgers:", tillFloatLedgers.value);
  }

  async function fetchBackofficeUsers(filter: any) {
    // Simulate API call
    // You can adjust this based on the filtering criteria or paging
    backofficeUsers.value = BackofficeUsers;
  }

  async function fetchTillOperators(filter: any) {
    // Simulate API call
    // You can adjust this based on the filtering criteria or paging
    tillOperators.value = TillOperators;
  }

  async function fetchFloatAllocations(filter: any) {
    // Simulate API call
    // You can adjust this based on the filtering criteria or paging
    floatAllocations.value = FloatAllocations;
  }

  // async function fetchFloatRequests(filter: any) {
  //   // Simulate API call
  //   // You can adjust this based on the filtering criteria or paging
  //   floatRequests.value = FloatRequests;
  // }

  // using the api

  // const fetchFloatRequests = async () => {
  //   return api.get("/till-operator/float-requests")
  //     .then((response: AxiosResponse<ApiResponse<any>>) => {
  //       floatRequests.value = response.data.data
  //     })
  // }
  async function fetchFloatRequests() {
    const { data } = await api.get("/till-operator/float-requests");
    floatRequests.value = data.data;
    console.log("Float Requests:", floatRequests.value);
  }

  // async function fetchFloatRequestsToAdmin() {
  //   const { data } = await api.get("/branch-manager/float-requests");
  //   floatRequestsToAdmin.value = data.data;
  //   console.log("Float Requests:", floatRequestsToAdmin.value);
  // }

  async function fetchFloatRequestsToAdmin() {
    try {
      const { data } = await api.get("/till-operator/float-requests");
  
      // Get branch from localStorage
      const storedAccount = localStorage.getItem("branchManagerAccount");
      if (storedAccount) {
        const account = JSON.parse(storedAccount);
        const userBranch = account.branch;
  
        // Filter requests by matching branch
        floatRequestsToAdmin.value = data.data.filter(
          (request: FloatRequest) => request.branch === userBranch
        );
  
        // Log the filtered requests to check if the filtering is working
        console.log("Filtered Float Requests:", floatRequestsToAdmin.value);
      } else {
        console.error("No branch manager account found in localStorage");
        floatRequestsToAdmin.value = [];
      }
    } catch (error) {
      console.error("Error fetching float requests:", error);
      floatRequestsToAdmin.value = [];
    }
  }


  async function requestFloatToAdmin(payload: RequestFloatToAdmin) {
    try {
      // Step 1: Create Float Ledger Entry first to get the ID
      const ledgerEntry = {
        date: new Date().toISOString(),
        description: payload.description,
        amount: payload.amount,
        status: "pending", // Initial status
        branch: payload.branch,
      };

      const ledgerResponse = await api.post("/branch-manager/add-float-ledger-record", ledgerEntry);
      const ledgerId = ledgerResponse.data.data.id; // Extracting ledger ID

      floatLedgers.value.push(ledgerResponse.data.data); // Store ledger entry in state
      console.log("Float ledger entry created:", ledgerResponse.data.data);

      // Step 2: Create Float Request (linking it to the ledger ID)
      const { data } = await api.post("/branch-manager/request-float", {
        amount: payload.amount,
        status: "pending",
        branch: payload.branch,
        description: payload.description,
        requestDate: new Date().toISOString(),
        ledgerId: ledgerId, // Linking the float request to the ledger
      });

      floatRequestsToAdmin.value?.push(data.data);
      console.log("Float request created and linked to ledger:", data.data);

    } catch (error) {
      console.error("Error in requestFloatToAdmin:", error);
    }
  }


  // function submit() {
  //   let payload = {
  //     amount: form.firstName,
  //     tillId: form.tillId,
  //   };
  //   loading.value = true;
  //   store
  //     .allocateFloat(payload)
  //     .then(() => {
  //       loading.value = false;
  //       notify.success(`Float assigned to ${form.tillId}.`);
  //       emit("cancel");
  //     })
  //     .catch(() => {
  //       loading.value = false;
  //     });
  // }

  // allocate float function, push to the float allocation array
  function allocateFloat(payload: AllocateFloat) {
    floatAllocations.value.push({
      id: floatAllocations.value.length + 1,
      dateAssigned: new Date().toISOString(),
      amount: payload.amount,
      status: "Allocated",
      till: payload.tillId,
    })
    //save to localstorage
    // saveTransactionsToLocalStorage();
  }

  const tillOperatorFloatBalance = ref(0);

  // const saveTransactionsToLocalStorage = () => {
  //   localStorage.setItem('tillOperatorFloatBalance', JSON.stringify(floatAllocations.value))
  // }

  // const savedFloatManagerBalance = JSON.parse(localStorage.getItem('tillOperatorFloatBalance') || '0');

  // if (savedFloatManagerBalance) {
  //   tillOperatorFloatBalance.value = savedFloatManagerBalance;
  // }


  // pass in the requestId
  // const approveFloatRequest = (requestId: any) => {
  //   store.approveFloatRequest(requestId);
  //   store.fetchFloatRequests();
  //   balanceStore.approveFloatRequest(requestId);
  //   store.reduceFloatLedger(requestId); 
  //   store.allocateFloat(requestId);
  //   console.log(`float request with id ${requestId} approved`);
  // };

  // allocate float based on approved float request
  function allocateFloatFromRequest(requestId: any) {
    const floatRequest = floatRequests.value.find((request) => request.id === requestId);
    if (floatRequest) {
      floatAllocations.value.push({
        id: floatAllocations.value.length + 1,
        dateAssigned: new Date().toISOString(),
        amount: floatRequest.amount,
        status: "Allocated",
        till: floatRequest.till,
      });


      // allocateFloatFromRequestToLocalStorage.value.push({
      //   id: allocateFloatFromRequestToLocalStorage.value.length + 1,
      //   dateAssigned: new Date().toISOString(),
      //   status: "Allocated",
      //   payload: floatRequest.amount,
      //    tillId: floatRequest.till,
      // })
      // saveFloatRequestToLocalStorage();
    }
    //save to localstorage
    // allocateFloatFromRequestToLocalStorage.value.push({
    //   id: allocateFloatFromRequestToLocalStorage.value.length + 1,
    //   dateAssigned: new Date().toISOString(),
    //   status: "Allocated",
    //   payload: floatRequest.amount,
    //    status: "Allocated",
    //    tillId: floatRequest.till,
    // })
    // saveFloatRequestToLocalStorage();
  }

  // const allocateFloatFromRequestToLocalStorage = ref<FloatRequest[]>([]);

  // const saveFloatRequestToLocalStorage = () => {
  //   localStorage.setItem('allocateFloatFromRequestToLocalStorage', JSON.stringify(allocateFloatFromRequestToLocalStorage.value))
  // }
  // allocate float allocation to float ledger array
  function adjustFloatLedger(payload: AllocateFloat) {
    floatLedgers.value.push({
      id: floatLedgers.value.length + 1,
      date: new Date().toISOString(),
      // description: "Till " + payload.tillId,
      description: payload.tillId,
      amount: -payload.amount,
      // balance: totalBalance.value + payload.amount,
    })
  }

  //   const allocateFloatFromRequestToLocalStorage = ref<FloatRequest[]>([]);

  // const saveFloatRequestToLocalStorage = () => {
  //   localStorage.setItem('allocateFloatFromRequestToLocalStorage', JSON.stringify(allocateFloatFromRequestToLocalStorage.value))
  // }

  // async function reduceFloatLedger(requestId: any) {
  //   //  This is local storage 

  //   // end of local storage

  //   console.log("Approving float request with ID:", requestId);
  //   // Simulate API call
  //   // const response = await fetch(`/api/float-requests/${requestId}/approve`, {
  //   //   method: "POST",
  //   // });
  //   // const data = await response.json();

  //   // use request in floatledgers array id to figure out amount 
  //   const floatRequest = floatRequests.value.find(
  //     (request) => request.id === requestId
  //   );
  //   if (!floatRequest) {
  //     console.error("Float request not found");
  //     return;
  //   }
  //   floatLedgers.value.push({
  //     id: floatLedgers.value.length + 1,
  //     date: new Date().toISOString(),
  //     description: floatRequest.till,
  //     amount: -floatRequest.amount,
  //     // balance: 450000000 - floatRequest.amount,
  //   });
  // }
  async function reduceFloatLedger(requestId: string) {
    try {
      console.log("Reducing float ledger for request ID:", requestId);

      // Step 1: Find the corresponding float request
      const floatRequest = floatRequests.value.find(request => request.id === requestId);

      if (!floatRequest) {
        console.error("Float request not found for ID:", requestId);
        return;
      }

      // Step 2: Create a new Float Ledger Entry with reduced amount
      const { data } = await api.post(`/branch-manager/add-float-ledger-record`, {
        requestId: floatRequest.id,
        date: new Date().toISOString(),
        description: floatRequest.description,
        amount: -floatRequest.amount, // Negative to indicate reduction
        status: "approved",
        till: floatRequest.till,
        approvedBy: "Manager One",
      });

      // Step 3: Update local state with new ledger entry
      floatLedgers.value.push(data.data);
      console.log("Float ledger reduced successfully:", data.data);

    } catch (error) {
      console.error("Error reducing float ledger:", error);
    }
  }

  async function reduceFloatLedgerAfterEdit(payload: FloatLedger) {
    try {
      console.log("The payload:", payload);

      // // Step 1: Find the corresponding float request
      // const floatRequest = floatRequests.value.find(request => request.id === requestId);

      // if (!floatRequest) {
      //   console.error("Float request not found for ID:", requestId);
      //   return;
      // }

      // Step 2: Create a new Float Ledger Entry with reduced amount
      const { data } = await api.post(`/branch-manager/add-float-ledger-record`, {
        requestId: payload.id,
        date: new Date().toISOString(),
        description: payload.description,
        amount: -payload.amount, // Negative to indicate reduction
        status: "edited",
        till: payload.till,
        approvedBy: "Manager One",
      });

      // Step 3: Update local state with new ledger entry
      floatLedgers.value.push(data.data);
      console.log("Float ledger reduced successfully:", data.data);

    } catch (error) {
      console.error("Error reducing float ledger:", error);
    }
  }


  // const rejectFloatRequest = (requestId: any) => {
  //   store.rejectFloatRequest(requestId);
  //   store.fetchFloatRequests();
  //   console.log(`float request with id ${requestId} rejected`);
  // };



  // const approveFloatRequest = (requestId: any) => {
  //   store.approveFloatRequest(requestId);
  // };

  // const rejectFloatRequest = (requestId: any) => {
  //   store.rejectFloatRequest(requestId);
  // };

  // approve float request using passed in Id and set status to approved
  // function approveFloatRequest(requestId: any) {
  //   const floatRequest = floatRequests.value.find((request) => request.id === requestId);
  //   if (floatRequest) {
  //     floatRequest.status = "Approved";
  //     floatRequest.approvedBy = "Manager One";
  //   }
  // }

  // approve float request using passed in Id and set status to approved and modify the floatrequests array
  // function approveFloatRequest(requestId: any) {
  //   console.log("changing status")
  //   const floatRequest = floatRequests.value.find((request) => request.id === requestId);
  //   if (floatRequest) {
  //     floatRequest.status = "approved";
  //     //change the float request in the api too
  //     // floatRequest.approvedBy = "Manager One";
  //   }
  // }

  // async function approveFloatRequest(requestId: string) {
  //   try {
  //     // Step 1: Find the float request
  //     const floatRequest = floatRequests.value.find(request => request.id === requestId);

  //     if (!floatRequest) {
  //       console.error("Float request not found for ID:", requestId);
  //       return;
  //     }

  //     // Step 2: Approve the Float Request
  //     console.log("Approving float request for ID:", requestId);


  //     const { data } = await api.put(`/branch-manager/approve-float-request/${requestId}`, {
  //       status: "approved",
  //       approvedBy: "Manager One",
  //       amount: floatRequest.amount,
  //       till: floatRequest.till,
  //       description: floatRequest.description,
  //       ledgerId: floatRequest.ledgerId, // Retain the ledger link
  //     });

  //     floatRequest.status = "approved";
  //     console.log("Float request approved successfully:", data);
  //     console.log("First API request succeeded, proceeding to approve ledger...");


  //     // Step 3: Approve the Float Ledger Record using `ledgerId`
  //     if (floatRequest.ledgerId) {
  //       // Retrieve the existing ledger entry to keep all fields
  //       console.log("Searching for ledger entry with ID:", floatRequest.ledgerId);
  //       console.log("Available ledgers:", floatLedgers.value);


  //       const ledgerEntry = floatLedgers.value.find(ledger => ledger.id === floatRequest.ledgerId);

  //       if (ledgerEntry) {
  //         await api.put(`/branch-manager/approve-float-ledger/${floatRequest.ledgerId}`, {
  //           ...ledgerEntry, // Retain all original fields
  //           status: "approved", // Only update status
  //         });

  //         console.log("Float ledger record approved:", ledgerEntry);
  //       } else {
  //         console.error("Ledger entry not found for ID:", floatRequest.ledgerId);
  //       }
  //     } else {
  //       console.error("Ledger ID not found in float request!");
  //     }

  //   } catch (error) {
  //     console.error("Error approving float request:", error);
  //   }
  // }
  async function approveFloatRequest(requestId: string) {
    try {
      const floatRequest = floatRequests.value.find(request => request.id === requestId);
      if (!floatRequest) {
        console.error("Float request not found:", requestId);
        return;
      }

      // Approve the float request
      await api.put(`/branch-manager/update-float-request/${requestId}`, { status: "approved", amount: floatRequest.amount, approvedBy: "Manager One" });
      floatRequest.status = "approved";

      // Approve the ledger entry if applicable
      if (floatRequest.ledgerId) {
        api.put(`/branch-manager/update-float-ledger/${floatRequest.ledgerId}`, { status: "approved", amount: floatRequest.amount, });
      }
      // }
    } catch (error) {
      console.error("Error approving float request:", error);
    }
  }

  //edit float request amount and allocated the new amount inserted in the form
  async function editFloatRequest(requestId: any, payload: any) {
    try {
      const floatRequest = floatRequests.value.find((request) => request.id === requestId);
      if (!floatRequest) {
        console.error("Float request not found for ID:", requestId);
        return;
      }

      const { data } = await api.put("/branch-manager/update-float-request/" + requestId, {
        amount: payload.amount,
        till: payload.till,
        // status: "request edited",
        status: "edited",
        description: payload.description,
        approvedBy: "Manager One",
      });
      floatRequests.value = data.data;
      console.log("Float Requests:", floatRequests.value);

      // Approve the ledger entry if applicable
      if (floatRequest.ledgerId) {
        api.put(`/branch-manager/update-float-ledger/${floatRequest.ledgerId}`, {
          amount: payload.amount,
          till: payload.till,
          // status: "request edited",
          status: "edited",
          description: payload.description,
          approvedBy: "Manager One",
        });
      }
    } catch (error) {
      console.error("Error editing float request:", error);
    }
  }



  //approve the float request using the api
  //   async function approveFloatRequest(requestId: any) {
  //     console.log("Request ID:", requestId); // Debugging
  //     // return api.post(`/branch-manager/approve-float-request/${requestId}`)
  //     return api.post("/branch-manager/approve-float-request/"+requestId)
  //         .then((response: AxiosResponse<ApiResponse<any>>) => {
  //             console.log("Approve Float Request response:", response.data);
  //             fetchFloatRequests();
  //             // fetchFloatLedgers();
  //             // fetchFloatAllocations();
  //         })
  // }

  // reject float request using passed in Id and set status to rejected
  // function rejectFloatRequest(requestId: any) {
  //   const floatRequest = floatRequests.value.find((request) => request.id === requestId);
  //   if (floatRequest) {
  //     floatRequest.status = "rejected";
  //   }
  // }
  async function rejectFloatRequest(requestId: string) {
    try {
      const floatRequest = floatRequests.value.find(request => request.id === requestId);
      if (!floatRequest) {
        console.error("Float request not found:", requestId);
        return;
      }

      // Approve the float request
      await api.put(`/branch-manager/update-float-request/${requestId}`, { status: "rejected", amount: floatRequest.amount, approvedBy: "Manager One" });
      floatRequest.status = "rejected";

      // Approve the ledger entry if applicable
      if (floatRequest.ledgerId) {
        api.put(`/branch-manager/update-float-ledger/${floatRequest.ledgerId}`, { status: "rejected", amount: floatRequest.amount });
      }
      // }
    } catch (error) {
      console.error("Error rejecting float request:", error);
    }
  }



  return {
    transactions,
    totalAmount,
    totalBalance,
    floatLedgers,
    backofficeUsers,
    tillOperators,
    floatAllocations,
    floatRequests,
    tillOperatorFloatBalance,
    floatRequestsToAdmin,
    tillFloatLedgers,

    fetchFloatRequestsToAdmin,
    reduceFloatLedger,
    reduceFloatLedgerAfterEdit,
    approveFloatRequest,
    editFloatRequest,
    adjustFloatLedger,
    rejectFloatRequest,
    fetchFloatRequests,
    requestFloatToAdmin,
    fetchTransactions,
    fetchFloatLedgers,
    fetchBackofficeUsers,
    fetchTillOperators,
    fetchTillFloatLedgers,
    fetchFloatAllocations,
    allocateFloat,
    allocateFloatFromRequest,
  };
});
