import React from "react";
import Placeholder from "../ui/Components/placeholder"; 
import Button from "../ui/Components/button";
import { Link } from "react-router-dom"; 
const Pro = () => {
    return (
      <div className="flex flex-col w-screen h-screen bg-[#F5EFE2] p-8">
        {/* Top Navigation */}
        <div className="max-w-screen flex justify-between border-b border-[#9B8562] pb-2 pl-20 pr-20">
          <span className="text-[#A9947F] cursor-pointer">
            Register as a viewer
          </span>
          <span className="text-[#7C5C41] font-medium border-b-2 border-[#7C5C41] pb-1 cursor-pointer">Register as an expert</span>
        </div>
  
        {/* Main Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mt-10 gap-10">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-[#9B8562] p-6 w-full max-w-md flex flex-col items-center justify-center text-center rounded-lg">
            <div className="flex flex-col items-center">
              <img src="/iconUpload.png" alt="Upload" className="w-12 mb-2" />
              <label className="cursor-pointer  bg-transparent hover:bg-[#7C5C41] px-4 py-2 border-[#7C5C41] rounded-md shadow-md text-black">
                Upload File
                <input type="file" className="hidden" />
              </label>
            </div>
            <p className="text-sm text-[#9B8562] mt-2">Only PDF </p>
            <p className="text-sm text-[#9B8562] mt-2"> PNG files are supported</p>
          </div>
  
          {/* Form Section */}
          <div className="w-full max-w-lg">
            <h2 className="text-3xl font-semibold text-black mb-6">Basic Info</h2>
  
            <div className="space-y-4">
              {/* Expertise Dropdown */}
              <div className="w-full flex flex-col">
               {/* <label className="block text-black text-sm font-medium">Expertise</label>*/}
                <select className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none">
                  <option>Select Expertise</option>
                  <option>Architecture</option>
                  <option>Archeologist</option>
                  <option>Historian</option>
                </select>
              </div>
  
              {/* Address Input */}
              <div>
                <Placeholder type='text' placeholder ='Adress'></Placeholder> 
              
              </div>
  
              {/* Affiliation Input */}
              <div>
                <Placeholder type='text' placeholder ='Affiliation'></Placeholder>
             </div>
  
              {/* Researcher Checkbox */}
              <div className="flex items-center">
                <input type="checkbox" className="w-4 h-4 border rounded mr-2" />
                <label className="text-black text-sm">Researcher</label>
              </div>
            </div>
  
            {/* Submit Button */}
            <div className="mt-6">
          <Link to={""} > <button className="w-full bg-white border border-black text-black px-6 py-3 rounded-md shadow-md hover:bg-gray-100 transition">
                Submit
              </button></Link> 
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Pro;
  