import api from "@/config/api"
import { useStorage, type RemovableRef } from "@vueuse/core"
import router from "@/router"
import { defineStore } from "pinia"
import type {
  SignInPayloadInterface,
  SignUpPayloadInterface,
  TokenRefreshPayloadInterface,
  ResendVerificationPayloadInterface,
  AuthResponseInterface,
  SignInResponseInterface,
  SignUpResponseInterface, UserProfileInterface
} from "@/agentadmindomain/auth/types"
import { ref, type Ref } from "vue"


export const useAccountStore = defineStore("accounts", () => {
  const profile: Ref<UserProfileInterface | undefined> = ref()
  const signUpResponse: Ref<SignUpResponseInterface | undefined> = ref()
  const signOutResponse: Ref<any | undefined> = ref()
  const storageCredentials: RemovableRef<string | null> = useStorage("credentials", null, sessionStorage)
  const username: RemovableRef<string | null> = useStorage("email", null)

  const signUp = async (payload: SignUpPayloadInterface) => {
    return api.post<AuthResponseInterface<SignUpResponseInterface>>("/auth/signup", payload).then((response: any) => {
      signUpResponse.value = response.data.data
      username.value = response.data.data.username
      // email.value = response.data.data.email
    })
  }

  const signIn = async (payload: SignInPayloadInterface) => {
    return api.post<AuthResponseInterface<SignInResponseInterface>>("/auth/login", payload).then((response: any) => {
      storageCredentials.value = JSON.stringify({ ...response.data.data, ...{ timestamp: response.data.time } })
      fetchProfile()
    })
  }

  const fetchProfile = async () => {
    return api.get("/auth/profile").then((response: any) => {
      profile.value = response.data.data
    })
  }
   

  // const fetchProfile = async () => {
  //   return api.get("/auth/profile").then((response: any) => {
  //     profile.value = response.data.data

  //     // redirect to the right dashboard using the role
  //     if (!profile.value) {
  //       console.error("Profile is undefined")
  //       return
  //     }
  
  //     // Now safely access profile.value.role
  //     if (profile.value.role === "AgentAdmi") {
  //       router.push({ name: "agent-admin-home" })
  //     } else if (profile.value.role === "BranchManager") {
  //       router.push({ name: "branch-manager-home" })
  //     } else if (profile.value.role === "TillOperator") {
  //       router.push({ name: "till-operator-home" })
  //     }
  //   })
  // }


  const verify = async () => {
    return api.post("/auth/verify").then(() => { })
  }

  const logout = async () => {
    return api.post("/auth/logout").then((response) => {
      signOutResponse.value = response.data
      storageCredentials.value = null
    })
  }

  const refresh = async (payload: TokenRefreshPayloadInterface) => {
    return api.post<AuthResponseInterface<SignInResponseInterface>>("/auth/refresh", payload).then((response) => {
      storageCredentials.value = JSON.stringify({ ...response.data.data, ...{ timestamp: response.data.time } })
    })
  }

  const resendVerification = async (payload: ResendVerificationPayloadInterface) => {
    return api.post("/auth/resend-verification", payload)
  }

  const confirmVerification = async (query: string) => {
    return api.post(`/auth/confirm?${query}`)
  }

  return { profile, signUpResponse, signOutResponse, signUp, signIn, fetchProfile, verify, logout, refresh, resendVerification, confirmVerification }
})
