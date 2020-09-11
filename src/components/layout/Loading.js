import React from 'react';
import {
    CircularProgress,
    createMuiTheme,
    ThemeProvider,
} from '@material-ui/core';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#7134eb',
            contrastText: '#fff',
        },
    },
});

export const Loading = () => {
    return (
        <ThemeProvider theme={theme}>
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <CircularProgress size={70} color="primary" />
            </div>
        </ThemeProvider>
    );
};
