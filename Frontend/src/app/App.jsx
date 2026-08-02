import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRoutes } from './app.routes.jsx'

const App = () => {
  return (
    <RouterProvider router={appRoutes} />
  )
}

export default App