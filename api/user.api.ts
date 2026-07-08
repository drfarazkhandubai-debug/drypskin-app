
import customAxios from "@/config/customAxios";

export const userApi = async (data: { name: string, phone: string, address: string }) => {
    try {
        const response = await customAxios.patch('/user', data)
        return response.data
    } catch (error: any) {
        throw error.response.data
    }
}