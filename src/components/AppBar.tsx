import { useContext, useState } from 'react';
import { Link } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { deepOrange, lightGreen } from '@mui/material/colors';
import OffLogo from '../assets/off-logo.png';
import off from '../off.ts';
import LoginContext from '../contexts/login.tsx';


const pages = [
  { label: "Home", path: '/', showtoUsers: ['moderator', 'user'] }, 
  { label: "Images", path: '/image-moderation', showtoUsers: ['moderator'] }, 
  { label: "Product", path: '/moderation', showtoUsers: ['moderator'] },
];
const settings = ['Logout'];

function ResponsiveAppBar() {

  const { isLoggedIn, isModerator } = useContext(LoginContext);
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (!isLoggedIn) {
      window.location.reload();
      window.location.href = '/login';
      setAnchorElUser(null);
    } else {
      setAnchorElUser(event.currentTarget);
    }
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    off.deleteCookie('session');
    handleCloseUserMenu();
    window.location.reload();
  }

  const filteredPages = isLoggedIn
    ? pages.filter((page) =>
        isModerator ? page.showtoUsers.includes('moderator') : page.showtoUsers.includes('user')
      )
    : 
    pages.filter((page) => page.showtoUsers.includes('user'));

  return (
    <AppBar position="static" sx={{backgroundColor: '#f2e9e4'}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
            <img 
              src={OffLogo}
              alt="off logo" 
              width={50}
              height={50}
            />
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            NUTRIPATROL
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{
                color: 'black',
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {filteredPages.map((page) => (
                <Link to={page.path} key={page.label}>
                  <MenuItem onClick={handleCloseNavMenu}>                  
                    <Typography 
                      textAlign="center"
                      sx={{
                        color: 'black',
                        fontFamily: 'monospace',
                        fontWeight: 400,
                        letterSpacing: '.3rem',
                        textDecoration: 'none',
                      }}
                    >
                      {page.label}
                    </Typography>                  
                  </MenuItem>
                </Link>
              ))}
            </Menu>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            <img 
              src={OffLogo}
              alt="off logo" 
              width={50}
              height={50}
            />
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            NUTRIPATROL
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {filteredPages.map((page) => (
              <Link to={page.path} key={page.label}>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  <Typography 
                    textAlign="center"
                    sx={{
                      color: 'black',
                      fontFamily: 'monospace',
                      fontWeight: 400,
                      letterSpacing: '.3rem',
                      textDecoration: 'none',
                    }}
                  >
                    {page.label}
                  </Typography>
                </Button>
              </Link>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {
                  isLoggedIn ? (
                    <Avatar sx={{ bgcolor: lightGreen[500] }} />
                  ) : (
                    <Avatar sx={{ bgcolor: deepOrange[500] }} />
                  )
                }
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;