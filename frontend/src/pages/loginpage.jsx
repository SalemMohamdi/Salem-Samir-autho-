import React,{ useState } from "react";
//import Cover from "../assets/Images";
import Button from "../ui/Components/button";
import axios from "axios"; 
import Placeholder from "../ui/Components/placeholder"; 
import { useContext } from "react";
import Slider from "../ui/Components/swiper";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const colors = {
  background: "#EDE8DD",
  primary: "#060606",
  disabled: "#D9D9D9",
};

const Login = () => {


  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      alert("Login successful!");
      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      alert("Login failed! " + error.response?.data?.message || error.message);
    }
  };


  return (

   <div className=" h-screen min-w-screen flex items-start bg-[#EDE8DD]">
      {/* Left Side - Image Section */}
      <div className="relative w-1/2 h-full flex flex-col">
    
        <div className="absolute top-[20%] left-[10%] flex flex-col"></div>
       
       <Slider className=""/>
        {/*<img src="/Cover_Image.jpg" className="w-full h-full object-cover" alt="Cover" />*/}
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 h-full flex flex-col p-20 pb-10 pt-10 justify-between">
        <h1 className="text-xl text-[primary] font-semibold"> </h1>
        <div className="w-full flex flex-col max-w-[550px]">
          <div className="w-full flex flex-col mb-2">
            <h1 className="text-4xl text-[#7C5C41] font-semibold mb-4 ">Login</h1>
            <p className="text-6xl text-[#7C5C41] font-semibold mb-4">Welcome Back!</p>
          </div>
 <form onSubmit="handleSubmit">
          {/* Input Fields */}
          {/*<Placeholder type="email" placeholder="Email"  onChange={handleChange} name={"email"}/>*/}
          <div className="w-full flex flex-col">
        <input
          type='email'
          name="email"
          value={credentials.email}
          placeholder='email'
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
      </div>
   

         
         
         
          {/*<Placeholder type="password" placeholder="Password"  onChange={handleChange} name={"password"}/>*/}
          <div className="w-full flex flex-col">
        <input
          type='password'
          placeholder='Password'
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          value={credentials.password}
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
      </div>

          {/* Remember Me & Forgot Password */}
          <div className="w-full flex justify-between items-center">
            <div className="w-full flex items-center">
              <input type="checkbox" className="w-4 h-4 mr-2" />
              <p className="text-sm text-black">Remember me</p>
            </div>
            <p className="text-sm text-black font-medium whitespace-nowrap cursor-pointer underline underline-offset-2">
              Forgot Password?
            </p>
          </div>

          {/* Login Button */}
          
          <div className="w-full flex flex-col">
           <Button type={'submit'}  message="Login" Click={handleSubmit}/> 
          </div>
          </form>

        </div>
        
        {/* Signup Link */}
        <div className="w-full flex items-center justify-center">
          <p className="text-sm font-normal text-black">
            Don't have an account?{" "}
            <Link to={"/signup"}>
            <span className="font-semibold underline underline-offset-2 cursor-pointer">
              Sign up
            </span>
            </Link>
          </p>
        </div>
      </div>
   </div>
  );
};

export default Login;
