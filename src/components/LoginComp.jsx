import { Dumbbell } from "lucide-react";
import React, { useState } from "react";
import axios from '../axios_simple'
import {useNavigate} from 'react-router-dom'
import {ClipLoader} from 'react-spinners'

const LoginComp = () => {
  const [isLoading,setIsLoading]=useState(false)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    console.log(form);
    // call your signup API here
    try{
      await axios.post('login/',form).then((res)=>{
        localStorage.setItem("token",res.data.access)
        setForm({
          username: "",
          password: "",
        })
        navigate('/gymapp')
      })
    }catch(error){
      alert(error)
    }
    finally{
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen max-h-full bg-black flex items-center justify-center  w-full">
      {/* Card */} 
      <div className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 shadow-2xl rounded-2xl w-full max-w-md p-6">
        
        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-2">
          <Dumbbell className='
        w-8
        h-8
        p-1
        bg-green-800
        rounded-[8px]
        '/>
          <h1 className="text-2xl font-semibold text-white">GymPro Connect</h1>
          <p className="text-zinc-400 text-sm">Login into the Admin Account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm text-zinc-300">Username</label>
            <input
              type="text"
              name="username"
              placeholder="salim"
              value={form.username}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>
          {/* Password */}
          <div>
            <label className="text-sm text-zinc-300">Password</label>
            <input
              type="password"
              name="password"
              placeholder="123"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </div>
          {/* Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition py-2 rounded-lg text-white font-semibold mt-2"
          >
            {isLoading ? 
            
            <div className="flex items-center gap-2 justify-center">
            <ClipLoader color="white" size={20} />
            <p>Starting Server... This may take a few seconds.</p>
            </div>
            
            :
            "Login"
            }
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-400 mt-6">
          Don't have an account?{" "}
          <span className="text-green-500 hover:underline cursor-pointer"
          onClick={()=>navigate('/signup')}
          >
            Create
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginComp;