import axios from "axios";
const instance = axios.create({
    baseURL:"https://gym-hub-sdo6.onrender.com"
})
export default instance
