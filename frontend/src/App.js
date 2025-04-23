import React, { useState } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8000/submit", 
        { name, description },
        { headers: { 'Content-Type': 'application/json' }}
      );
      setName("");
      setDescription("");
      console.log("Submit successful");
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Submit Item</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      /><br/><br/>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      /><br/><br/>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default App;
