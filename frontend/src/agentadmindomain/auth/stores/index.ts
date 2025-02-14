import api from "@/config/api"
import { useStorage, type RemovableRef } from "@vueuse/core"
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

  // const fetchProfile = async () => {
  //   return api.get("/auth/profile").then((response: any) => {
  //     profile.value = response.data.data
  //   })
  // }
  const fetchProfile = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await api.get("/auth/profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      profile.value = response.data.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };


  // const fetchProfile = async () => {
  //   const storedData = storageCredentials.value ? JSON.parse(storageCredentials.value) : null
  //   const token = storedData?.token

  //   if (!token) {
  //     console.error("No token found in storageCredentials")
  //     return
  //   }

  //   return api.get("/auth/profile", {
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   }).then((response: any) => {
  //     profile.value = response.data.data
  //   }).catch((error) => {
  //     console.error("Profile fetch failed:", error.response.data)
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
