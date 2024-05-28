import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom'
import OffLogo from '../assets/off-logo.png';
import { deepOrange, lightGreen } from '@mui/material/colors';
import off from '../off.ts';

const pages = [
  { label: "Home", path: '/'}, 
  { label: "Images", path: '/image-moderation' }, 
  { label: "Product", path: '/moderation' },
];
const settings = ['Logout'];

interface ResponsiveAppBarProps {
  isLoggedIn: boolean;
}

function ResponsiveAppBar({ isLoggedIn }: ResponsiveAppBarProps) {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

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
              {pages.map((page) => (
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
            {pages.map((page) => (
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
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleLogout}>
                  <Typography 
                  textAlign="center" 
                  sx={{
                    color: 'black',
                    fontFamily: 'monospace',
                    fontWeight: 400,
                    letterSpacing: '.3rem',
                    textDecoration: 'none',
                  }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;