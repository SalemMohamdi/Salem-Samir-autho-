import Button from "../ui/Components/button"; 
import Placeholder from "../ui/Components/placeholder"; 
import { Link } from "react-router-dom";


const Congratulation = () => {
    return (
      <div className="flex flex-col  h-full w-screen bg-[#F5EFE2] p-6">
        {/* Top Navigation */}
        <div className="max-w-screen flex justify-between  border-b border-[#9B8562] pb-2 pr-40 pl-40">
          <span className="text-[#7C5C41] font-medium border-b-2 border-[#7C5C41] pb-1 cursor-pointer">
            Register as a viewer
          </span>
          <span className="text-[#A9947F] cursor-pointer">Register as an expert</span>
        </div>
  
        {/* Main Content */}
        <div>
          <h1 className="text-center text-3xl font-semibold text-[#7C5C41] mb-15 mt-15">Congratulation</h1>
          <p className="mt-4 text-black text-left text-xl ">
            <strong className="text-black text-left ">Your registration as a <span className="text-[#9B8562]">Viewer</span></strong> 
            {" "}is successful — now take the next step!</p>
            <p className="text-left text-black text-xl"> Upgrade to a Professional Expert account and gain recognition as a 
            trusted authority in Algerian architecture. Enjoy exclusive benefits, connect with industry leaders, and unlock advanced features.
          </p>
        </div>
  
        <div className="relative flex justify-between items-end w-full mt-8">
        {/* Image (Bottom Left) */}
        <div className="absolute bottom-0 left-0">
          <img src="/roman.png" alt="Roman Statue" className="w-full max-w-md object-contain" />
        </div>

        {/* CTA Section (Bottom Right) */}
        <div className="flex flex-col items-end text-right ml-auto mb-6">
          <p className="self-center text-2xl text-black">Showcase your expertise</p>
          <p className="self-center text-2xl text-black">and make an impact today!</p>

         <Link to={"/propage"}> <button className="self-center mt-4 bg-[#7C5C41] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#8A7553] transition">
            Become an Expert
          </button> </Link>

          <p className="mt-2 text-sm text-gray-500 self-center cursor-pointer hover:underline">Skip</p>
        </div>
      </div>
      </div>
    );
  };
  
  export default Congratulation;
  