// import axios from "axios"

// export async function register({username, email, password}) {
//     try{
//         const response = await axios.post('http://localhost:3000/api/auth/register',{
//             username, email, password
//         },{
//             withCredentials: true
//         })
//         return response.data
//     }catch(err){
//         console.log(err)
//     }
// }


// export async function login({email, password}){
//     try{

//         const response = await axios.post("http://localhost:3000/api/auth/login",{
//             email,password
//         },{withCredentials:true})
//         return response.data
//     }catch(err){
//         console.log(err)
//     }
// }


// export async function logout(){
//     try{
//         const response = await axios.get("http://localhost:3000/api/auth/logout", {
//             withCredentials:true
//         })
//         return response.data
//     }catch(err){
    
// }
// }
 
// export async function getMe(){
//    try{
//     const response = await axios.get("http://localhost:3000/api/auth/get-me",{
//         withCredentials:true
//     })
//     return response.data

//    }catch(err){
//     console.log(err)
//    }
// }

import axios from "axios"

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:3000" : "")
).trim().replace(/\/$/, "")

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data

    } catch (err) {

        console.log(err)

    }

}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
    }

}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        return response.data

    } catch (err) {

    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        console.log("getMe error", err)
        throw err
    }

}