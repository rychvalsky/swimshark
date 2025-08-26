import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './ui/App'
import Home from './pages/Home'
import About from './pages/About'
import LessonsInfo from './pages/LessonsInfo'
import LessonsForm from './pages/LessonsForm'
import SummerCamp from './pages/SummerCamp'
import SummerCampInfo from './pages/SummerCampInfo'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import RequireAuth from './ui/RequireAuth'
import AdminLogin from './pages/AdminLogin'
import './ui/index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
  { index: true, element: <Home /> },
  { path: 'o-nas', element: <About /> },
  { path: 'lekcie', element: <LessonsInfo /> },
  { path: 'lekcie/prihlasenie', element: <LessonsForm /> },
  { path: 'letny-tabor', element: <SummerCampInfo /> },
  { path: 'letny-tabor/prihlasenie', element: <SummerCamp /> },
  { path: 'kontakt', element: <Contact /> },
  { path: 'admin', element: <RequireAuth><Admin /></RequireAuth> },
  { path: 'admin/prihlasenie', element: <AdminLogin /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
