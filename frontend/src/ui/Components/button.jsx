const Button = ({ message , Click,type}) => {
    return (
      <div className="w-full flex flex-col">
        <button onClick={Click} type={type} className="w-full bg-amber-950 text-white rounded-md py-4 text-center flex items-center justify-center my-4">
          {message}
        </button>
      </div>
    );
  };
  
  export default Button;
  