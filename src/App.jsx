import React from 'react'
import Navbar from './components/Nabar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home';
import Footer from './components/Footer';

const App = () => {
  const isOwner = useLocation().pathname.includes("owner");
  return (
    <div>
     {!isOwner && <Navbar />}
     <div className='min-h-[70vh]'>
      <Routes>
        <Route path='/' element={<Home/>} />
      </Routes>
     </div>
     <Footer />
    </div>
  )
}

export default App
