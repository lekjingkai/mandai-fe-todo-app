// src/components/NavBar.tsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface NavBarProps {
    onToggleSidebar: () => void;
    title?: string;
}

const NavBar: React.FC<NavBarProps> = ({ onToggleSidebar, title = 'MyTodoApp' }) => (
    <AppBar position="static">
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
            <Typography variant="h6" component="div">
                {title}
            </Typography>
        </Toolbar>
    </AppBar>
);

export default NavBar;
