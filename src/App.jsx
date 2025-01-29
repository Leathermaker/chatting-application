import { useEffect, useMemo, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from 'socket.io-client'

function App() {
    const socket = useMemo(()=>{
      return  io('http://localhost:3000')
    },[])
    const [text,setText] = useState([])
    const [userText,setUserText] = useState()
function handleSub(){
  socket.emit('room',{text,room})
  console.log(text)
}

 
  useEffect(()=>{
    socket.on('new-user',(data)=>{
      console.log(data)      
  })

  socket.on('receive',(msg)=>{

    setText(text=>[...text,msg])
    console.log(text)
  })
  },[])

    
   
  return (
    <>
    {
      socket&&
      socket.id

    }

   
    <div className='relative bg-red-200 w-[100vw] h-[100vh]'>

      <div className='bg-green-400 h-14 flex justify-center items-center'>
        <h1 className='text-center  text-4xl '>Chat App</h1>
      </div>

        {
          text.map((element,index)=>{
            return <div key={index}>
              {element}
            </div>
          })
        }
      <div className='fixed bottom-0 w-full flex justify-center items-center'>
        
      
    
        <button className='bg-green-400 w-[10%] font-semibold text-2xl  h-10' onClick={()=>{
          socket.emit('message',"welcome broski")
        }}>Send</button>
      </div>
    
    </div>
    </>
  )
}

export default App
