
import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CourseDetail from './pages/CourseDetail';
import NotFound from './pages/NotFound';
import CreateCourse from './pages/CreateCourse';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/course/:id',
    element: <CourseDetail />,
  },
  {
    path: '/create-course',
    element: <CreateCourse />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/onboarding',
    element: <Onboarding />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
