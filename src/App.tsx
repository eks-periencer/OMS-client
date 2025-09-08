import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import  Sidebar  from './pages/pages/admin/settings/page.tsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Sidebar />
    </>
  )
}

export default App