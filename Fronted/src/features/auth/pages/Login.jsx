// import React,{useState} from 'react'
// import { useNavigate,Link } from 'react-router'
// import "../auth.form.scss"
// import { useAuth } from '../hooks/useAuth'

// const Login = () => {

//    const {loading, handleLogin} = useAuth()
//    const navigate = useNavigate()

//    const [email,setEmail] = useState("")
//    const [password,setPassword] = useState("")

//   const handleSubmit = async (e)=>{
//     e.preventDefault()
//     await handleLogin({email,password})
//     navigate('/')
//   }

//   if(loading){
//     return (<main><h1>Loading.....</h1></main>)
//   }

//   return (
//     <main>
//       <div className='form-container'>
//         <h1>Login</h1>

//         <form onSubmit={handleSubmit}>
//           <div className='input-group'>
//             <label htmlFor="email">Email</label>
//             <input
//             onChange={(e)=>{setEmail(e.target.value)}}
//              type="email" id="email" name="email" placeholder='Enter email address'>
//             </input>
//           </div>

//            <div className='input-group'>
//             <label htmlFor="password">password</label>
//             <input 
//             onChange={(e)=>{setPassword(e.target.value)}}
//             type="password" id="password" name="password" placeholder='Enter password'>
//             </input>
//           </div>
          
//           <button className='button primary-button'>Login</button>
//         </form>
//         <p>Don't have an account?<Link to={"/register"}>Register</Link></p>
//       </div>
//     </main>
//   )
// }

// export default Login

import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:3000" : "")
).trim().replace(/\/$/, "")
const GOOGLE_AUTH_URL = `${API_BASE_URL}/api/auth/oauth/google`

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim() || !password.trim()) {
            alert("Please enter both email and password.")
            return
        }

        await handleLogin({ email, password })
        navigate('/')
    }

    if(loading){
        return (<main><h1>Loading.......</h1></main>)
    }


    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
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
                    <button className='button primary-button' >Login</button>
                </form>
                <button
                    type='button'
                    className='button secondary-button'
                    onClick={() => { window.location.href = GOOGLE_AUTH_URL }}
                >
                    Continue with Google
                </button>
                <p>Don't have an account? <Link to={'/register'}>Register</Link> </p>
            </div>
        </main>
    )
}

export default Login