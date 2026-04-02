// import { useContext,useEffect } from "react";
// import { AuthContext } from "../auth.context";
// import { login, register, logout,getMe } from "../services/auth.api";

// export const useAuth = () =>{
//     const context = useContext(AuthContext)
//     const {user,setUser,loading,setLoading}= context
//     const handleLogin = async ({email,password})=>{
//         setLoading(true)
//         try{
//          const data=await login({email, password})
//         setUser(data.user)
//         }catch(err){

//         }finally{
//             setLoading(false)
//         }
//     }
     
//    const handleRegister = async({username,email,password})=>{
//        setLoading(true)
//        try{
//           const data = await register({username, email, password})
//        setUser(data.user)
//        }catch(err){

//        }finally{
//        setLoading(false)
//        }
//    }
   
//    const handleLogout = async()=>{
//     setLoading(true)
//     try{
//       const data = await logout()
//       setUser(null)
//     }catch(err){

//     }finally{
     
//     setLoading(false)
//     }
    
    
//    }
    
//     useEffect(()=>{
//         const getAndSetUser=async()=>{
//             try{
//                 const data = await getMe()
//                 setUser(data.user)
//             }catch(err){}finally{
//                     setLoading(false)
//             }
       
      
//         }
//         getAndSetUser()
//     },[])
 
   
//    return { user, loading, handleRegister, handleLogin, handleLogout}
// }

import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { InterviewContext } from "../../interview/interview.content";
import { login, register, logout, getMe } from "../services/auth.api";



export const useAuth = () => {

    const context = useContext(AuthContext)
    const interviewContext = useContext(InterviewContext)
    const { user, setUser, loading, setLoading } = context
    const { setReport, setReports } = interviewContext || {}


    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            if (setReports) setReports([])
            if (setReport) setReport(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            if (setReports) setReports([])
            if (setReport) setReport(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            if (setReports) setReports([])
            if (setReport) setReport(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {

                const data = await getMe()
                setUser(data?.user || null)
            } catch (err) {
                if (err?.response?.status === 401) {
                    setUser(null)
                } else {
                    console.error("getMe failed", err)
                }
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}