// import React, { useState } from 'react'
// import { useNavigate, Link } from 'react-router'
// import { useAuth } from '../hooks/useAuth'
// const Register = ()=> {

  


//   const navigate = useNavigate()
//   const[username,setUsername]=useState("")
//   const[email,setEmail]=useState("")
//   const[password, setPassword]=useState("")

//   const {loading,handleRegister}=useAuth()
//     const handleSubmit = async(e)=>{
//     e.preventDefault()
//     await handleRegister({username,email,password})
//     navigate("/")
//   }

//   return (
//     <main>
//       <div className='form-container'>
//         <h1>Register</h1>

//         <form onSubmit={handleSubmit}>
//           <div className='input-group'>
//             <label htmlFor="username">Username</label>
//             <input 
//             onChange={(e)=>{setUsername(e.target.value)}}
//             type="text" id="username" name="username" placeholder='Enter username'>
//             </input>
//           </div>

//           <div className='input-group'>
//             <label htmlFor="email">Email</label>
//             <input 
//             onChange={(e)=>{setEmail(e.target.value)}}
//             type="email" id="email" name="email" placeholder='Enter email address'>
//             </input>
//           </div>

//            <div className='input-group'>
//             <label htmlFor="password">password</label>
//             <input 
//             onChange={(e)=>{setPassword(e.target.value)}}
//             type="password" id="password" name="password" placeholder='Enter password'>
//             </input>
//           </div>

//           <button className='button primary-button'>Register</button>
//         </form>

//           <p>Already have an account ? <Link to ={"/login"}>Login</Link></p>

//       </div>
//     </main>
//   )
// }
// export default Register

import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    "https://interview-ai-planner-3.onrender.com"
).trim().replace(/\/$/, "")
const GOOGLE_AUTH_URL = `${API_BASE_URL}/api/auth/oauth/google`

const Register = () => {

    const { loading, handleRegister } = useAuth()
    const navigate = useNavigate()

    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({ username, email, password })
        navigate('/')
    }

    if (loading) {
        return (<main><h1>Loading.......</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter username' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' />
                    </div>
                    <button className='button primary-button' >Register</button>
                </form>
                <button
                    type='button'
                    className='button secondary-button'
                    onClick={() => { window.location.href = GOOGLE_AUTH_URL }}
                >
                    Continue with Google
                </button>
                <p>Already have an account? <Link to={'/login'}>Login</Link></p>
            </div>
        </main>
    )
}

export default Register