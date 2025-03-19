// @ts-ignore
//import Image from 'next/image';
//import Cover_Image from '../../assets/Images/Cover_Image.jpeg';
import React from "react";
import Button from "../ui/Components/button"; 
import Placeholder from "../ui/Components/placeholder"; 
import axios from "axios";
import { useState, useContext } from "react";
import Slider from "../ui/Components/swiper";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
const colors = {
    background:"#EDE8DD",
    primary:"#060606",
    disabaled:"#D9D9D9",

}





 const Signup= () => {
 
   
   
    const { authState , register } = useContext(AuthContext);
    const navigate = useNavigate();
  
    const [formData, setFormData] = useState({
      name: "",
      surname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
       is_validated: false,
       is_authenticated: false,

       role: "user", // Default role
    affiliation: "",
    certificate: "",
    expertise: "",
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
   
   
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
    
      if (file) {
        // Validate file type
        if (file.type !== "application/pdf") {
          alert("Only PDF files are allowed!");
          e.target.value = ""; // Reset file input
          return;
        }
    
        // Read file as Base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setFormData({ ...formData, certificate: reader.result });
        };
      }
    };



    const handleSubmit = async (e) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
  
      try {
        await register (formData);
        alert("Signup successful!");
        navigate("/login"); // Redirect to login page
      } catch (error) {
        alert("Signup failed! " + error.response?.data?.message || error.message);
      }
    };






    return(
        <div className="w-screen h-screen flex items-start bg-[#EDE8DD]">
            <div className="relative w-1/2 h-full flex flex-col">
            <div className="absolute top-[20%] left-[10%] flex flex-col">
           
            </div>
           {/*<img src="/Cover_Image.jpg" className="w-full h-full object-cover" />*/ } 
           <Slider></Slider>
            </div>
        <div className='w-1/2 h-full bg-  flex flex-col pt-10 p-20 pb-10 justify-between'>
          <h1 className='text-xl text-[primary] font-semibold'> </h1>
           <div className='w-full flex flex-col max-w-[550px]'>
            <div className='w-full flex flex-col mb-2'>
           <h1 className="text-4xl text-[#7C5C41] font-semibold mb-4 bg-blue">Registration</h1> 
           
          
        {/* <p className='text-6xl tex font-semibold mb-4'>Welcome</p>   */}
           </div>
           <form onSubmit={handleSubmit}>
      <input type="text" />

               {/* <Placeholder value={formData.name}  type='text' placeholder ='First Name' onchange='{handleChange}'></Placeholder>
                <Placeholder value={formData.surname}  type='text' placeholder ='Last Name' onchange='{handleChange}'></Placeholder>
                <Placeholder value={formData.email}  type='email' placeholder ='Email' onchange='{handleChange}'></Placeholder>
                
                <Placeholder value={formData.password}  type='password' placeholder ='Password' onchange='{handleChange}'></Placeholder>
                <Placeholder value={formData.confirmPassword}  type='password' placeholder ='Confirm Password' onchange='{handleChange}'></Placeholder>
*/}
 <div className="w-full flex flex-col">
        <input
          type='text'
          name="name"
          required
          placeholder='First Name'
          onChange={(e) => setFormData({...formData, name: e.target.value })}
          value={formData.name}
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
        </div>
      
      
      
        <div className="w-full flex flex-col">
        <input
          type='text'
          name="surname"
          placeholder='Last Name'
          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
          value={formData.surname}
          required
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
        </div>


        <div className="w-full flex flex-col">
        <input
          type='email'
          name="email"
          placeholder='Email'
          value={formData.email}
          onChange={(e) =>setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
        </div>


        <div className="w-full flex flex-col">
        <input
          type='password'
          name="password"
          placeholder='Password'
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
        </div>





        <div className="w-full flex flex-col">
        <input
          type='password'
          name="confirmPassword"
          value={formData.confirmPassword}
          placeholder='ConfirmPassword'
          required
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
        </div>

        <select name="role" value={formData.role} onChange={handleChange} className="w-full text-black  my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none">
            <option value="user">User</option>
            <option value="expert">Expert</option>
          </select>

 
 
 
 {/* Role Selection */}
 

          {/* Show Expert-Specific Fields Only if "Expert" is Selected */}
          {formData.role === "expert" && (
            <>
              <div className="w-full flex flex-col">
        <input
          type='text'
          name="affiliation"
          value={formData.affiliation}
          placeholder='affiliation'
          required
          onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
          
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />

<select name="expertise" value={formData.expertise} onChange={handleChange} className="w-full text-black  my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none">
            <option value="architecture">Architecture</option>
            <option value="archeologist">Archeologist</option>
            <option value='historian'>Historian</option>
          </select>

<input
          type='file'
          name="certificate"
          accept="application/pdf"
         
          placeholder='Enter your Certificate'
          required
          onChange={handleFileUpload}
          
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />

        </div>
     
            </>
          )}






            <div className='w-full flex justify-between items-center'>
<div className='w-full flex items-center'>
    <input type="checkbox" className='w-4 h-4 mr-2'/>
    <p className='text-sm text-black'>Remember me</p>
</div>
  
  


            </div>


<div className='w-full flex flex-col'>
   {/* Role Selection */}
   
    
  {/*<Link to={"/congratulation"}>  <Button type='Submit'  message='Sign up'></Button> </Link>*/}
  <div className="w-full flex flex-col">
        <button type='submit' className="w-full bg-amber-950 text-white rounded-md py-4 text-center flex items-center justify-center my-4">
          Sign up
        </button>
      </div>
</div>
</form>
<div className='w-full flex items-center justify-center'>
            <p className='text-sm font-normal text-black'>already have an account <Link to={"/login"}> <span className='font-semibold underline underline-offset-2 cursor-pointer'>Sign in </span> </Link></p>
           </div>

            </div>
           
            </div>
        </div>
    )
}
export default Signup;
