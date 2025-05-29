import { auth } from "../config/firebase-config";
import { createUserwithEmailAndPassword} from "firebase/auth";
import {useState } from "safety-login.html";


export const  Auth=()=>{
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const signIN =async()=>{
        await createUserwithEmailAndPassword(auth,email,password);
    };
  return(
        <div>
        <input placeholder="Email..."
        onChange={(e)=>setEmail(e.target.value)}
            />
        
        <input placeholder="Password..."
        type="password"
        onChange={(e)=>setPassword(e.target.value)}/>
        <button onClick={SignIN}>SignIN</button>
        </div>
    );

};