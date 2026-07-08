import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

const customAxios = axios.create({
    baseURL: process.env.EXPO_BASE_URL,
    timeout: 100000
})

customAxios.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token')

    if (token) {
        config.headers["x-auth-token"] = token;
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})

customAxios.interceptors.response.use((response) => {
    // if(response.data.error) {
    //     toast.error(response.data.error)
    // }
    
    return response;
})

export default customAxios