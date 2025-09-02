import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'primary.main', boxShadow: 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
          IDPB
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            component={Link}
            to="/dashboard"
            sx={{ color: 'primary.main' }}
          >
            Início
          </Button>
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            component={Link}
            to="/meu-perfil"
            sx={{ color: 'primary.main' }}
          >
            Meu Perfil
          </Button>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ color: 'error.main' }}
          >
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;