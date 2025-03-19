const Placeholder = ({ type, placeholder,onchange,name}) => {
    return (
      <div className="w-full flex flex-col">
        <input
          type={type}
          placeholder={placeholder}
          onChange={onchange}
          name={name}
          className="w-full text-black py-2 my-2 border-b bg-transparent border-amber-900 outline-none focus:outline-none"
        />
      </div>
    );
  };
  
  export default Placeholder;