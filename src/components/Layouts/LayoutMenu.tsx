// Layout Menu Component
import AppBar from '../AppBar'
import AuthAlert from '../AuthAlert';

interface LayoutMenuProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  alertIsOpen: boolean;
  setAlertIsOpen: (isOpen: boolean) => void;
}

export default function LayoutMenu({ children, isLoggedIn, alertIsOpen, setAlertIsOpen }: LayoutMenuProps) {
  return (
    <div className='main-container'>
        <AppBar isLoggedIn={isLoggedIn} />
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