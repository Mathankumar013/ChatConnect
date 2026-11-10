import { Route, Routes } from 'react-router-dom';
import './assets/css/auth.css';
import './assets/css/profile.css';
import './assets/css/responsive.css';
import './assets/css/style.css';

// import './assets/js/app';
// import './assets/js/chat';
// import './assets/js/messages';
// import './assets/js/socket';
// import './assets/js/users'
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';

function App() {


  return (
    <>
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/profile' element={<EditProfile/>}/>
      </Routes>
    </>
  )
}

export default App
