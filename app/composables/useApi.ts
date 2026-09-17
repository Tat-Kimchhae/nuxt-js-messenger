import {toast} from "vue-sonner";

export function useApi() {
  const isLoading = ref(false)

  async function call<T>(request: () => Promise<T>, {successMessage}: { successMessage?: (res: T) => string } = {}): Promise<T | null> {
    isLoading.value = true
    try {
      const res = await request()
      if (successMessage) toast.success(successMessage(res))
      return res
    } catch (err: any) {
      const message = err.data?.message || err.message || "Something went wrong"
      console.error(message)
      toast.error(message)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {call, isLoading}
}