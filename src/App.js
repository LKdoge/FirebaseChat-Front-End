import React, { Fragment, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth'; 

import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SendIcon from '@mui/icons-material/Send';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import {Button, TextField, Grid, Avatar} from '@mui/material';
 
firebase.initializeApp({ 
  apiKey: "AIzaSyAaSLRxK40iBQ0ta_DC-Y3y1ZA6xmhQIpM",
  authDomain: "chatbot-318219.firebaseapp.com",
  projectId: "chatbot-318219",
  storageBucket: "chatbot-318219.appspot.com",
  messagingSenderId: "811942198022",
  appId: "1:811942198022:web:78cb2f5f0dce066381fc87",
  measurementId: "G-9R9G98KPME"
});

// Initializing Firebase
const auth = firebase.auth();
const firestore = firebase.firestore();

// @params auth
function App() {
  const [
    user
    // , setUser
  ] = useAuthState(auth)
  return (
    <div className="App">
        {user ? 
        <ChatRoom />
         : <SignIn />}
    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
    <>
      <Grid sx={{ bgcolor: 'white'}} className="App">
        <Button item xs={12} sx={{ width: '100%', height: '50px', }} id='OpenChat' className="openChatBox" onClick={()=>signInWithGoogle()}>Sign In With Google</Button>
      </Grid>
    </>
  )
}

function SignOut() {
  const [showChat, setShowChat] = useState(true);
  const textBox = document.getElementById('Chat');
  const toggleChat = () =>{
  if(showChat===true){
    textBox.style.height = "0px";
    textBox.style.opacity = 0;
    setShowChat(false);
  }else{
    textBox.style.height = "460px";
    textBox.style.opacity = 1;
    setShowChat(true);
    }
  }

  return auth.currentUser && (
    <Grid 
    sx={{ width: '100%', maxWidth: "350px",  bgcolor: 'white', height: '50px'}} className="SignOut">
      <Button item xs={10} sx={{  width: '80%', fontSize:"15px", color:'gray', height: '50px' }}  className = "Openbot" onClick={()=> toggleChat()}><p id="chatWithUs">Linh !</p></Button>
      <Button item xs={2} 
      sx={{ width: '20%', height: '50px', }} id='OpenChat' className="openChatBox" onClick={() => auth.signOut()}><img alt="Sign out" src={HighlightOffIcon}></img></Button>
    </Grid>
    )
}

function ChatRoom(){
  const messagesRef = firestore.collection('messages');//Using Database Messages
  const query = messagesRef.orderBy('createdAt').limit(25);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  
  const sendMessage = async(e) =>{
    e.preventDefault(); //To avoid page reloading
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text:formValue,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
  }

  const getBotResponse = async (e) =>{
    const responseURL = `http://127.0.0.1:3001/message?message=${formValue}`;
    const messagesRef = firestore.collection('messages');//Using Database Messages
    const uid='Bot-1920';
    const photoURL = 'https://st3.depositphotos.com/23611030/34312/v/450/depositphotos_343122236-stock-illustration-chat-bot-icon-vector-isolated.jpg'
    // const responseURL = 'http://127.0.0.1:3001/';

    const message = await fetch(responseURL)
      .then(response => {
          return response.json()
      })
      .catch(error => {
          console.log(error)
      });
  
    await messagesRef.add({
      text: message.response,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
  }

  const callbackSubmit = () => {
    sendMessage();
    getBotResponse();
  }

  const callbackSend = (e) => {
    sendMessage(e);
    getBotResponse(e);
  }
  
  
   return(
    <>
      <Grid  
      sx={{ width: '100%', maxWidth: "350px",  bgcolor: 'white'}} className="app">
      <SignOut></SignOut>
        <Grid className="ChatBox" id='Chat'> 
          <Grid  
          id="textBox" className="textBox" sx={{ height: '400px', marginTop:'10px', overflow:'scroll' }}>
            {messages && messages.map(msg => <ChatMessage className="textBox" key={msg.id} message={msg} />)}
          </Grid>

          <Grid sx={{ bgcolor: 'white', width:"320px", margin:"auto" }} className="sendMessageBox" onSubmit={()=>callbackSubmit()}>
            <TextField item xs={10} sx={{ width: '80%' }} id='MessageInput' label="Chat with us!" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            <Button item xs={2} sx={{ width: '20%', fontSize:"25px", color:'gray' }} type="submit" disabled={!formValue} onClick={(e)=>(callbackSend(e))}>
              <img alt="Sign out" src={SendIcon}></img>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
   )
}


function ChatMessage(props) {
  const [
    // value,
     setValue] = React.useState('Controlled');

  const handleChange = (event) => {
    setValue(event.target.value);
  };
  
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "SendMessages" : "RecievedMessages";

  return (
    <Grid className={`${messageClass}`} sx={{ width: '100%' , maxWidth:'320px', margin:"auto"}}>
      {/* <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} /> */}
      {messageClass === "SendMessages"?
      <Fragment>
        <Grid sx={{display:"flex", marginTop:"10px", marginBottom:"10px"}} >
          <Grid item xs={10} sx={{ width: '80%'}}>
            <TextField sx={{ width: '100%'}}
              id="standard-multiline-flexible"
              label=""
              multiline
              disabled={true}
              value={text}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={2} sx={{ width: '20%'}}>
            <Avatar src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} sx={{ width: '30px', height:'30px', margin:"auto" }}></Avatar>
            {/* // <Chip item xs={10} variant="outlined" sx={{ width: '85%', marginTop:'10px', borderRadius:'4px' }} label={text}/> */}
          </Grid>
        </Grid>
      </Fragment>
      :
      <Fragment>
        <Grid
        sx={{display:"flex", marginTop:"10px", marginBottom:"10px"}}>
          <Grid item xs={2} sx={{ width: '20%'}}>
            <Avatar src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} sx={{ width: '30px', height:'30px', margin:"auto"}}></Avatar>
          </Grid>
          
          <Grid item xs={10} sx={{ width: '80%'}}>
            <TextField sx={{ width: '100%'}}
              id="standard-multiline-flexible"
              label=""
              multiline
              disabled={true}
              value={text}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </Fragment> 
      }
    </Grid>
  )
}

export default App;