import React, { useState } from "react";

const FileUpload = () => {
    const [base64String, setBase64String] = useState("");

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/pdf") {
            convertToBase64(file);
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    const convertToBase64 = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(",")[1]; // Extract only the Base64 part
            setBase64String(base64String);
            console.log("Base64 Encoded PDF:", base64String);
        };
        reader.onerror = (error) => console.error("Error: ", error);
    };

    const sendToBackend = async () => {
        if (!base64String) {
            alert("No file selected!");
            return;
        }

        try {
            const response = await fetch("https://your-backend.com/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ file: base64String }),
            });

            const data = await response.json();
            console.log("Server Response:", data);
        } catch (error) {
            console.error("Error sending file:", error);
        }
    };

    return (
        <div>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            <button onClick={sendToBackend}>Upload</button>
        </div>
    );
};