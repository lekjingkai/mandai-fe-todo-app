// src/components/NavBar.tsx
import React from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logoUrl from '../assets/Logo-Mandai-EquaGreen.svg';

interface NavBarProps {
    onToggleSidebar: () => void;
    title?: string;
}

const NavBar: React.FC<NavBarProps> = ({
                                           onToggleSidebar,
                                           title = 'MyTodoApp',
                                       }) => (
    <AppBar position="static" sx={{ bgcolor: '#faf5e8', color: '#063200' }}>
        <Toolbar>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={onToggleSidebar}
                sx={{ mr: 2 }}
            >
                <MenuIcon />
            </IconButton>

            <Box
                display="flex"
                alignItems="center"
                sx={{
                    flexGrow: 1,
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                }}
            >
                <img
                    src={logoUrl}
                    alt="logo"
                    width={60}
                    height={60}
                    style={{ marginRight: 12 }}
                />
                <Typography variant="h6" component="div" sx={{ color: '#063200' }}>
                    {title}
                </Typography>
            </Box>
        </Toolbar>
    </AppBar>
);

export default NavBar;
