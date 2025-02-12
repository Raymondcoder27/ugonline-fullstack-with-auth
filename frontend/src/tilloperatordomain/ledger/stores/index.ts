// domain/billing/stores.ts

import { defineStore } from "pinia";
import { ref } from "vue";
import moment from "moment";
import api from "@/config/api";
import type { Transaction, FloatLedger, FloatRequest, RequestFloat } from "@/tilloperatordomain/billing/types";

export const useBilling = defineStore("billing", () => {
  //  data for testing
  const Transactions: Transaction[] = [
    { id: 1, amount: 100, description: "Sample Transaction 1" },
    { id: 2, amount: 200, description: "Sample Transaction 2" },
    { id: 3, amount: 300, description: "Sample Transaction 3" },
  ];

  // const FloatLedgers: FloatLedger[] = [
  //   { id: 1, name: "Sample FloatLedger 1", balance: 500 },
  //   { id: 2, name: "Sample FloatLedger 2", balance: 1000 },
  //   { id: 3, name: "Sample FloatLedger 3", balance: 1500 },


  // ];


  const FloatLedgers: FloatLedger[] = [
    { id: 1, description: "Recharge", amount: 15000000, balance: 15000000, status: "success", date: "2021-09-01" },
    { id: 2, description: "Service fee", amount: -25000, balance: 14975000, status: "success", date: "2021-09-01" },
    { id: 3, description: "Recharge", amount: 500000, balance: 15475000, status: "success", date: "2021-09-02" },
    // { id: 4, description: "Service fee", amount: -40000, balance: 15435000, status: "pending", date: "2021-09-03" },
    // { id: 5, description: "Service fee", amount: -30000, balance: 15405000, status: "failed", date: "2021-09-04" },
    // { id: 6, description: "Recharge", amount: 2000000, balance: 17405000, status: "success", date: "2021-09-05" },
    // { id: 7, description: "Withdrawal", amount: -5000000, balance: 12405000, status: "success", date: "2021-09-06" },
    // { id: 8, description: "Recharge", amount: 3000000, balance: 15405000, status: "success", date: "2021-09-07" },
    // { id: 9, description: "Service fee", amount: -50000, balance: 15400000, status: "pending", date: "2021-09-08" },
    // { id: 10, description: "Recharge", amount: 1000000, balance: 16400000, status: "success", date: "2021-09-09" },
    // { id: 11, description: "Service fee", amount: -20000, balance: 16380000, status: "success", date: "2021-09-10" },
  ];


  //  float requests
  const FloatRequests: FloatRequest[] = [
    { id: 1, requestDate: "2021-09-01", amount: 15000000, status: "pending", branchId: 1 },
    { id: 2, requestDate: "2021-09-02", amount: 500000, status: "approved", branchId: 2 },
    { id: 3, requestDate: "2021-09-03", amount: 40000, status: "rejected", branchId: 3 },
    { id: 4, requestDate: "2021-09-04", amount: 30000, status: "pending", branchId: 4 },
    { id: 5, requestDate: "2021-09-05", amount: 2000000, status: "approved", branchId: 5 },
    { id: 6, requestDate: "2021-09-06", amount: 750000, status: "rejected", branchId: 6 },
    { id: 7, requestDate: "2021-09-07", amount: 1000000, status: "pending", branchId: 7 },
    { id: 8, requestDate: "2021-09-08", amount: 300000, status: "approved", branchId: 8 },
    { id: 9, requestDate: "2021-09-09", amount: 150000, status: "rejected", branchId: 9 },
    { id: 10, requestDate: "2021-09-10", amount: 5000000, status: "approved", branchId: 10 },
    { id: 11, requestDate: "2021-09-11", amount: 250000, status: "pending", branchId: 11 },
  ];


  // State variables
  const transactions = ref<Transaction[]>(Transactions); // Use  data for now
  const totalAmount = ref(600); // Set a test value
  const totalBalance = ref(3000); // Set a test value
  // const floatLedgers = ref<FloatLedger[]>(FloatLedgers); // Use  data for now
  const floatLedgers = ref<FloatLedger[]>([]); // Use  data for now


  // const allocateFloatFromRequestToLocalStorage = JSON.parse(localStorage.getItem('allocateFloatFromRequestToLocalStorage') || '0');

  // if (allocateFloatFromRequestToLocalStorage) {
  //   floatLedgers.value = allocateFloatFromRequestToLocalStorage;
  // }


  // Actions to fetch data
  // async function fetchTransactions(filter: any) {
  //   // Simulate API call
  //   // const response = await fetch(`/api/transactions?limit=${filter.limit}&page=${filter.page}`);
  //   // const data = await response.json();
  //   // Use  data for now
  //   transactions.value = Transactions;
  //   totalAmount.value = 600;  // Set a test value
  //   totalBalance.value = 3000; // Set a test value
  // }

  async function fetchTransactions(filter: any) {
    const filteredData = Transactions.filter(transaction => {
      return (!filter.filter[0].operand || transaction.description.includes(filter.filter[0].operand)) &&
        (!filter.filter[1].operand || transaction.amount > Number(filter.filter[1].operand)) &&
        (!filter.filter[2].operand || transaction.balance > Number(filter.filter[2].operand)) &&
        (!filter.fromDate || moment(transaction.date).isAfter(moment(filter.fromDate))) &&
        (!filter.toDate || moment(transaction.date).isBefore(moment(filter.toDate)));
    });


    transactions.value = filteredData;
    console.log("Filtered transactions:", filteredData);
  }

  async function fetchFloatLedgers() {
    const { data } = await api.get("/till-operator/float-ledgers");
    floatLedgers.value = data.data;
    console.log("Float Ledgers:", floatLedgers.value);
  }
  // async function fetchFloatLedgers(filter: any) {
  //   console.log("Fetching Float Ledgers with filter:", filter);

  //   const filteredData = FloatLedgers.filter(item => {
  //     // Filter logic...
  //   });

  //   const limitedData = filteredData.slice(0, filter.limit || FloatLedgers.length);
  //   floatLedgers.value = limitedData;
  //   console.log("Filtered float ledgers:", limitedData);
  //   return limitedData;  // Add this return to make the data available for use
  // }

  //first make float requests array with statuses: pending, approved, rejected
  // const floatRequests = ref<FloatRequest[]>(FloatRequests);
  const floatRequests = ref<FloatRequest[]>([]);

  const floatRequest = ref<FloatRequest | null>(null);

  //fetch float requests
  // async function fetchFloatRequests() {
  //   // Simulate API call
  //   // const response = await fetch(`/api/float-requests?limit=${filter.limit}&page=${filter.page}`);
  //   // const data = await response.json();
  //   // Use  data for now
  //   floatRequests.value = FloatRequests;
  // }
  //   floatRequests.value = FloatRequests;
  async function fetchFloatRequests() {
    const { data } = await api.get("/till-operator/float-requests");
    floatRequests.value = data.data;
    console.log("Float Requests:", floatRequests.value);
  }

  // allocate float function, push to the float allocation array
  //  function allocateFloat(payload: AllocateFloat) {
  //   floatAllocations.value.push({
  //     id: floatAllocations.value.length + 1,
  //     dateAssigned: new Date().toISOString(),
  //     amount: payload.amount,
  //     status: "Allocated",
  //     branch: payload.branchId,
  //   })
  // }

  // request float function, push to the float requests array
  // function requestFloat(payload: RequestFloat) {
  //   floatRequests.value.push({
  //     id: floatRequests.value.length + 1,
  //     requestDate: new Date().toISOString(),
  //     amount: payload.amount,
  //     status: "pending",
  //     // status: "success",
  //     // tillId: payload.tillId,
  //           tillId: "Till 1",
  //     description: "Till " + payload.tillId,
  //   })
  //   //save to localstorage
  //   floatRequestToBranchManagerLocalStorage.value.push({
  //     id: floatRequests.value.length + 1,
  //     requestDate: new Date().toISOString(),
  //     amount: payload.amount,
  //     status: "success",
  //     // tillId: payload.tillId,
  //     tillId: "Till 1",
  //     branch: "Branch 1"
  //   })
  //   saveFloatRequestToLocalStorage();
  // }


  // const requestFloat = async (payload: RequestFloat) => {
  //   return api.post("/till-operator/request-float", payload)
  //     .then((response: AxiosResponse<ApiResponse<any>>) => {
  //       floatRequest.value = response.data.data
  //       console.log("Request Float response:", floatRequest);
  //       //push the request to the float requests array
  //       // floatRequests.value.push({
  //       //   id: floatRequests.value.length + 1,
  //       //   requestDate: new Date().toISOString(),
  //       //   amount: payload.amount,
  //       //   status: "pending",
  //       //   // status: "success",
  //       //   // tillId: payload.tillId,
  //       //         tillId: "Till 1",
  //       //   description: "Till " + payload.tillId,
  //       // })
  //       // floatRequests.value = response.data.data
  //     })
  // }

  // using the api
  // async function requestFloat(payload: RequestFloat) {
  //   // Simulate API call
  //   // const response = await fetch(`/till-operator/request-float`, {
  //     const response = await api.post(`/till-operator/request-float`, {
  //     method: "POST",
  //     body: JSON.stringify(payload),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const data = await response.json();
  //   console.log("Request Float response:", data);
  // }

  // const floatRequestToBranchManagerLocalStorage = ref<FloatRequest[]>([]);

  // const saveFloatRequestToLocalStorage = () => {
  //   localStorage.setItem('floatRequestToBranchManagerLocalStorage', JSON.stringify(floatRequestToBranchManagerLocalStorage.value))
  // }

  // adjust float ledgers with float request
  // function adjustFloatLedger(payload: RequestFloat) {
  //   floatLedgers.value.push({
  //     id: floatLedgers.value.length + 1,
  //     date: new Date().toISOString(),
  //     description: payload.description,
  //     amount: payload.amount,
  //     balance: totalBalance.value + payload.amount,
  //     status: "pending",
  //     // status: "success",
  //   })
  // }
  async function requestFloat(payload: RequestFloat) {
    try {
      // Step 1: Create Float Ledger Entry first to get the ID
      const ledgerEntry = {
        // date: new Date().toISOString(),
        description: payload.description,
        amount: payload.amount,
        status: "pending", // Initial status
        till: payload.till,
      };

      const ledgerResponse = await api.post("/till-operator/add-float-ledger-record", ledgerEntry);
      const ledgerId = ledgerResponse.data.data.id; // Extracting ledger ID

      floatLedgers.value.push(ledgerResponse.data.data); // Store ledger entry in state
      console.log("Float ledger entry created:", ledgerResponse.data.data);

      // Step 2: Create Float Request (linking it to the ledger ID)
      const { data } = await api.post("/till-operator/request-float", {
        amount: payload.amount,
        status: "pending",
        till: payload.till,
        description: payload.description,
        // requestDate: new Date().toISOString(),
        ledgerId: ledgerId, // Linking the float request to the ledger
      });

      floatRequests.value?.push(data.data);
      console.log("Float request created and linked to ledger:", data.data);

    } catch (error) {
      console.error("Error in requestFloatToAdmin:", error);
    }
  }


  return {
    transactions,
    totalAmount,
    totalBalance,
    floatLedgers,
    floatRequests,
    requestFloat,
    // adjustFloatLedger,
    fetchFloatRequests,
    fetchTransactions,
    fetchFloatLedgers,
  };
});
