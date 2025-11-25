import React, { useState, useEffect } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBrowser, cilLockLocked, cilUser } from '@coreui/icons'
import md5 from "md5";
import { baseURL } from '../../../utilities/api'
import { setSessionValue } from '../../../utilities/session'
import { setItemStorage, getItemStorage } from '../../../utilities/localstorage'
import { useAuth } from '../../../utilities/authContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [companyname, setCompanyName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ companyname: false, username: false, password: false })
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const fetchStoredCredentials = async () => {
      const storedUsername = await getItemStorage('crm:username');
      const storedCompanyname = await getItemStorage('crm:companyname');
      if (storedUsername) setUsername(storedUsername);
      if (storedCompanyname) setCompanyName(storedCompanyname);
    };
    fetchStoredCredentials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Reset error on new attempt
    setLoginError('');
  
    const newErrors = {
      companyname: companyname.trim() === '',
      username: username.trim() === '',
      password: password.trim() === '',
    };
  
    setErrors(newErrors);
  
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;
  
    setIsLoading(true);
  
    const loginObj = {
      db: companyname,
      name: username,
      password: md5(password),
      isemaillogin: true,
    };
  
    try {
      const response = await fetch(baseURL + "login", {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(loginObj),
      });
  
      const data = await response.json();
      console.log("Login response data:", data);

      if (data.status === "fail") { 
        console.error("Login failed:", data.message);
        setLoginError(data.message || 'Invalid credentials. Please try again.');
        return;
      }
  
      // Successful login flow
      const companyDetailsRes = await fetch(`${baseURL}settings?db=${data.company}`);
      const companyDetails = await companyDetailsRes.json();
      //console.log(companyDetails);

      if (companyDetails.status === "fail") {
        setLoginError('Failed to load company settings.');
        return;
      }

      if (companyDetails.status === "fail") {
        setLoginError('Failed to load company settings.');
        return;
      }
      
      console.log("Navigating to dashboard...");
      setSessionValue('crm:authtoken', data.token);
      setSessionValue('crm:userid', data.id);
      setSessionValue('crm:company', companyDetails);
      setSessionValue('crm:database', companyname);
      setItemStorage('crm:username', username);
      setItemStorage('crm:companyname', companyname);
      login(data.token);
      navigate('/dashboard');

    } catch (err) {
      console.error("Unexpected error:", err);
      setLoginError("Something went wrong. Please try again later.");
    }
    finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              {/* Intro card */}
              <CCard className="text-white bg-primary py-5 d-none d-md-block" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>CRM</h2>
                    <p>
                      Efficiently manage your clients from one powerful yet simple workspace.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>

              {/* Login form */}
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    {loginError && (
                      <div className="text-danger mb-3" role="alert">
                        {loginError}
                      </div>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilBrowser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Company"
                        autoComplete="company"
                        value={companyname}
                        onChange={(e) => setCompanyName(e.target.value)}
                        invalid={errors.companyname}
                      />
                    </CInputGroup>                    
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        invalid={errors.username}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        invalid={errors.password}
                      />
                    </CInputGroup>
                    <CRow>
                    <CCol xs={12}>
                      <CButton
                        type="submit"
                        color="primary"
                        className="px-4 w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Logging in...' : 'Login'}
                      </CButton>
                    </CCol>
                      {/*<CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>*/}
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
