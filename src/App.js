import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { async } from '@firebase/util';

firebase.initializeApp({
  apiKey: "AIzaSyBsWw5OGj_oTnd9H_Q53GPHsg4_hah3s4E",
  authDomain: "fireship-demos-2a7a8.firebaseapp.com",
  projectId: "fireship-demos-2a7a8",
  storageBucket: "fireship-demos-2a7a8.appspot.com",
  messagingSenderId: "971602116505",
  appId: "1:971602116505:web:bdcdbf018876b7d3155d08"
})
const auth = firebase.auth();
const firestore = firebase.firestore(); 
const analytics = firebase.analytics(); 

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1><img className='logo' src={process.env.PUBLIC_URL + '/speak.png'}></img> Chating Room</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn()
{
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <center>
      <img className='img-google' src={process.env.PUBLIC_URL + '/google.png'}></img>
      <br></br>
      <button className='button' onClick={signInWithGoogle}>Sign in with google</button>
    </center>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button className='button-red' onClick={()=>auth.signOut()}>Keluar</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      displayName
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Tuliskan pesan anda" />

      <button type="submit" disabled={!formValue}>Kirim</button>

    </form>
  </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  const displayNameClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img className='img' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p><span className={`nama${displayNameClass}`}>{displayName}</span><br></br>{text}</p>
    </div>
  </>)
}

export default App;
