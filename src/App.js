import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './components/Dashboard';
import Scrolltotop from './Scrolltotop';
import Login from './components/Login';
import Registration from './components/Registration';
import ApplyNow from './components/ApplyNow';
import FilledPdf from './components/FilledPdf';
import SdmReport from './components/SdmReport';
import PsReport from './components/PsReport';


const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const user_id = params.get('user_id');
const role = params.get('role');
if (token) localStorage.setItem('authToken', token);
if (user_id) localStorage.setItem('user_id', user_id);
if (role) localStorage.setItem('role', role);


function App() {
  return (
    <div className="App"> 
      <Router>
      <Scrolltotop/>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/registration' element={<Registration/>}/>
          <Route path='/Dashboard' element={<Dashboard/>}/>
          <Route path='/apply-now' element={<ApplyNow/>}/>
          <Route path='/filled-pdf/:id' element={<FilledPdf/>}/>
          <Route path='/validation-report/:id' element={<SdmReport/>}/>
          <Route path="/ps-report/:applicationId" element={<PsReport />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;