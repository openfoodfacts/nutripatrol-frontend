// Layout Menu Component
import { useContext } from 'react';
import AppBar from '../AppBar'
import AuthAlert from '../AuthAlert';
import LoginContext from '../../contexts/login';

interface LayoutMenuProps {
  children: React.ReactNode;
  alertIsOpen: boolean;
  setAlertIsOpen: (isOpen: boolean) => void;
}

export default function LayoutMenu({ children, alertIsOpen, setAlertIsOpen }: LayoutMenuProps) {

  const { isLoggedIn } = useContext(LoginContext);

  return (
    <div className='main-container'>
        <AppBar/>
        <AuthAlert 
          message={isLoggedIn ? 'You are now logged in.' : 'You are now logged out.'} 
          severity={isLoggedIn ? 'success' : 'info'}
          isOpen={alertIsOpen} 
          setIsOpen={setAlertIsOpen}
        />
        { children }
    </div>
  );
}