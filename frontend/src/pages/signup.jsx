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
        numero: "",
       role: "user", // Default role
    affiliation: "",
    certificate: "",
    niv_expertise: "",
    });
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const [error, setError] = useState("");

    const handlePasswordChange = (e) => {
      const password = e.target.value;
      setFormData({ ...formData, password });
  
      // Check if password has a capital letter
      
      if (!/[A-Z]/.test(password)) {
        setError("Password must contain at least one uppercase letter.");
      } 
      // Check if password is at least 12 characters
      else if (password.length < 12) {
        setError("Password must be at least 12 characters long.");
      } 
      else {
        setError(""); // Clear error when both conditions are met
      }
    };
   
   
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
    
      if (!file) return; // No file selected
    
      // Check for PDF type
      if (!file.type.includes("pdf")) {
        alert("Only PDF files are allowed!");
        e.target.value = ""; // Reset file input
        return;
      }
    
      // Check file size (max 5MB)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        alert("File size must be under 5MB.");
        e.target.value = "";
        return;
      }
    
      // Read file as Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
        reader.onload = () => {
          const base64String = reader.result.split(",")[1]; // Remove "data:application/pdf;base64,"
          setFormData((prev) => ({ ...prev, certificate: base64String }));
        };
     
    
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
      };
    };
    




    
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
    
      try {
        await register(formData);
        alert("Signup successful!");
        navigate("/"); // Redirect to login page
      } catch (error) {
        if (error.response) {
          // Handle specific error responses
          const { status, data } = error.response;
          
          if (status === 400) {
            alert(`Signup failed: ${data.error || "Invalid input. Please check your details."}`);
          } else if (status === 409) {
            alert(`Signup failed: ${data.message.error || "Email or username already exists."}`);
          } else {
            alert(`Signup failed: ${data.message || "An unexpected error occurred."}`);
          }
        } else {
          // Handle network or unexpected errors
          alert("Signup failed: Unable to connect to the server. Please try again.");
        }
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
     

               {/* <Placeholder value={formData.name}  type='text' placeholder ='First Name' onchange='{handleChange}'></Placeholder>
                <Placeholder value={formData.surname}  type='text' placeholder ='Last Name' onchange='{handleChange}'></Placeholder>
                <Placeholder value={formData.email}  type='email' placeholder ='Email' onchange='{handleChange}'></Placeholder>
                
                <Placeholder value={formData.password}  type='password' placeholder ='Password' onchange='{handleChange}'></Placeholder>
                <Placeholder value={formData.confirmPassword}  type='password' placeholder ='Confirm Password' onchange='{handleChange}'></Placeholder>
*/}
<div className=" flex flex-row  ">
  {/* First Name */}
  <div className="w-1/2 pr-15">
    <input
      type="text"
      name="name"
      required
      placeholder="First Name"
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      value={formData.name}
      className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
    />
  </div>

  {/* Last Name */}
  <div className="w-1/2  ">
    <input
      type="text"
      name="surname"
      placeholder="Last Name"
      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
      value={formData.surname}
      required
      className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
    />
  </div>
</div>

        <div className="w-full flex flex-col">
        <input
          type='text'
          name="username"
          required
          placeholder='username'
          onChange={(e) => setFormData({...formData, username: e.target.value })}
          value={formData.username}
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
        <input
  type='text'
  name="numero"
  required
  placeholder='Phone Number'
  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
  value={formData.numero}
  className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
/>


<div className="w-full flex flex-col">
  <input
    type="password"
    name="password"
    placeholder="Password"
    value={formData.password}
    onChange={handlePasswordChange}
    required
    className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
  />
  {error && <p className="text-red-500 text-sm ">{error}</p>}
</div>





<div className="w-full flex flex-col">
  <input
    type="password"
    name="confirmPassword"
    placeholder="Confirm Password"
    value={formData.confirmPassword}
    onChange={(e) =>setFormData({ ...formData, confirmPassword: e.target.value })}
    required
    className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
  />
</div>

        <select name="role" value={formData.role} onChange={handleChange} className="w-full text-black  my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none">
            <option value="user">User</option>
            <option value="architecte">Architecture</option>
            <option value="archeologue">Archeologist</option>
            <option value=' historien'>Historian</option>
          </select>

 
 
 
 {/* Role Selection */}
 

          {/* Show Expert-Specific Fields Only if "Expert" is Selected */}
          {formData.role !== "user" && (
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

<select name="niv_expertise" value={formData.niv_expertise} onChange={handleChange} className="w-full text-black  my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none">
         <option >Select your level of expertise</option>
         <option value="Early-Career">Early-Career </option>
            <option value="Senior ">Senior </option>
            <option value='Distinguished '>Distinguished</option>
          </select>
          <input
          type='file'
          name="certificate"
          accept="application/pdf"
         
          
          required
          onChange={handleFileUpload}
          placeholder='Enter your Certificate'
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
        <button type='submit' className="w-full bg-amber-950 text-white rounded-md py-4 text-center flex items-center justify-center my-4" onSubmit={handleSubmit}>
          Sign up
        </button>
      </div>
    
</div>
</form>
<div className='w-full flex items-center justify-center'>
            <p className='text-sm font-normal text-black'>already have an account <Link to={"/"}> <span className='font-semibold underline underline-offset-2 cursor-pointer'>Sign in </span> </Link></p>
           </div>

            </div>
           
            </div>
        </div>
    )
};
export default Signup;
 