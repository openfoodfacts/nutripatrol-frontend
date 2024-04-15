// Layout Menu Component
import AppBar from '../AppBar'

interface LayoutMenuProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
}

export default function LayoutMenu({ children, isLoggedIn }: LayoutMenuProps) {
  return (
    <div className='main-container'>
        <AppBar isLoggedIn={isLoggedIn} />
        { children }
    </div>
  );
}