import { Dumbbell } from "lucide-react";
import React, {useState} from 'react'
import { useNavigate } from "react-router-dom";
import axios from "../axios_simple";

function SignUp() {
  const navigate = useNavigate()
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        
      });
    
      const handleChange = (e) => {
        setForm({
          ...form,
          [e.target.name]: e.target.value,
        });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
          alert("Password and Confirm Password must match");
          return;
        }
        // call your signup API here
        try{
          const { confirmPassword, ...payload } = form;
          console.log(payload);
          const response = await axios.post('register/', payload)
          alert("User Created")
          navigate('/')
          console.log("User Created and Saved",response.data)
          setForm({
            'username':"",
            'email':"",
            'password':"",
            'confirmPassword':'',
        })
        }catch(error){
          console.error(error.response.data)
          alert("Error saving data")
        }
      };
    
      const passwordMismatch =
        form.password.length > 0 &&
        form.confirmPassword.length > 0 &&
        form.password !== form.confirmPassword;

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
              <p className="text-zinc-400 text-sm">Create Admin Account</p>
            </div>
    
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="text-sm text-zinc-300">Full Name</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Create your username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
    
              {/* Email */}
              <div>
                <label className="text-sm text-zinc-300">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
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
                  placeholder="Enter you Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
              </div>
    
              {/* Confirm Password */}
              <div>
                <label className="text-sm text-zinc-300">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm you Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-green-600"
                  required
                />
                {passwordMismatch ? (
                  <p className="mt-1 text-sm text-red-400">
                    Passwords do not match.
                  </p>
                ) : null}
              </div>
    
              {/* Button */}
              <button
                type="submit"
                disabled={passwordMismatch}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition py-2 rounded-lg text-white font-semibold mt-2"
              >
                Create Account
              </button>
            </form>
    
            {/* Footer */}
            <p className="text-center text-sm text-zinc-400 mt-6">
              Already have an account?{" "}
              <span className="text-green-500 hover:underline cursor-pointer"
              onClick={()=>navigate('/')}>
                Login
              </span>
            </p>
          </div>
        </div>
      );
}

export default SignUp;