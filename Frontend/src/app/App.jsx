import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRoutes } from './app.routes.jsx'
import { useSelector } from 'react-redux'
import { useAuth } from '../features/auth/hook/useAuth.js'
import { useEffect } from 'react'

const App = () => {
  const { handleGetMe} = useAuth()

  useEffect(() => {
    handleGetMe()
  }, [])
    
  return (
    <RouterProvider router={appRoutes} />
  )
}

export default App